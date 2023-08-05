version = 1

import copy
from datetime import datetime
import traceback
import globalVariable
import checking_function_major

notPassGrade = ["F", "AU", "CR", "I", "PP", "W", "----"]
passNonLetterGrade = ["DI", "PA", "P", "T"]

def main(request_data):
    global major
    major = copy.deepcopy(globalVariable.major)
    return recommendProg(request_data)

def recommendProg(data):
    getUserInfo(data)
    minor, option, ext, m = checkProg(data)
    recommend_prog = []
    
    if minor != []:
        for i in range(len(minor)):
            o = {}
            if minor[i][0] == 0:
                break
            if "cga" in major["0"][minor[i][2]]["attr"]:
                if cga < major["0"][minor[i][2]]["attr"]["cga"]:
                    continue
            o["type"] = "minor"
            o["name"] =  minor[i][2]
            o["year"] =  year
            o["percent"] = int(minor[i][0] * 100)
            recommend_prog.append(o)

    if option != []:
        for i in range(len(option)):
            o = {}
            if "cga" in major[year][option[i][2]]["attr"]:
                if cga < major[year][option[i][2]]["attr"]["cga"]:
                    continue
            o["type"] = "option"
            o["name"] =  option[i][2]
            o["year"] =  year
            o["percent"] = int(option[i][0] * 100)
            recommend_prog.append(o)
    
    if ext != []:
        o = {}
        o["type"] = "extended_major"
        o["name"] =  ext[0][2]
        o["year"] =  0
        o["percent"] = int(ext[0][0] * 100)
    
    if m != []:
        for i in range(len(m)):
            o = {}
            if "cga" in major[year][m[i][2]]["attr"]:
                if cga < major[year][m[i][2]]["attr"]["cga"]:
                    continue
            o["type"] = "major"
            o["name"] =  m[i][2]
            o["year"] =  year
            o["percent"] = int(m[i][0] * 100)
            recommend_prog.append(o)
            break
    try:
        return recommend_prog
    except:
        print(traceback.format_exc())

def getUserInfo(data):
    userdb = data["userdb"]
    global user
    user = copy.deepcopy(userdb)
    global year
    year = "20"
    year += user["profile"]["currentStudies"]["yearOfIntake"][:2]

    current = datetime.now()
    global yearTaken
    yearTaken = current.year % 2000 - int(int(user["profile"]["currentStudies"]["yearOfIntake"]) / 100)
    match user["profile"]["currentStudies"]["yearOfIntake"][2]:
        case "1":
            intakeMonth = 9
        case "2":
            intakeMonth = 1
        case "3":
            intakeMonth = 2
        case "4":
            intakeMonth = 6
    month = 12 - intakeMonth + current.month
    yearTaken += month / 12

    gpaSum = 0
    creditSum = 0
    for i in user["courses"]:
        sem = semesterSort(i)
        grade = gradeMapping(user["courses"][i][sem[0]]["grade"])
        if grade == 0.1:
            continue
        creditSum += int(user["courses"][i][sem[0]]["units"])
        gpaSum += int(user["courses"][i][sem[0]]["units"]) * grade
    
    global cga
    if creditSum:
        cga = gpaSum / creditSum
    else:
        cga = 0

def checkProg(data):
    minor = []
    option = []
    ext = []
    m = []
    for i in major["0"]:
        if i in user["profile"]["currentStudies"]["mm"]:
            continue
        data["prog"] = [i]
        output = checking_function_major.main(data)
        if "credit" in output[i]["respattr"]:
            minor.append([output[i]["respattr"]["credit"] / output[i]["attr"]["cred_fulfill"], output[i]["attr"]["cred_fulfill"], i])
        else:
            minor.append([0, output[i]["attr"]["cred_fulfill"], i])
    
    for i in major[year]:
        if i in user["profile"]["currentStudies"]["mm"]:
            continue
        if major[year][i]["attr"]["type"] == "option":
            for j in user["profile"]["currentStudies"]["mm"]:
                if j in major[year]:
                    if major[year][j]["attr"]["short"] == major[year][i]["attr"]["short"]:
                        data["prog"] = [i]
                        output = checking_function_major.main(data)
                        if "credit" in output[i]["respattr"]:
                            option.append([output[i]["respattr"]["credit"] / output[i]["attr"]["cred_fulfill"], output[i]["attr"]["cred_fulfill"], i])
                        else:
                            option.append([0, output[i]["attr"]["cred_fulfill"], i])
        elif major[year][i]["attr"]["type"] == "extended_major":
            if yearTaken > 1:
                continue
            else:
                data["prog"] = i
                output = checking_function_major.main(data)
                if "credit" in output[i]["respattr"]:
                    ext.append([output[i]["respattr"]["credit"] / output[i]["attr"]["cred_fulfill"], output[i]["attr"]["cred_fulfill"], i])
                else:
                    ext.append([0, output[i]["attr"]["cred_fulfill"], i])
        else:
            check = True
            if "excl" in major[year][i]["attr"]:
                for j in user["profile"]["currentStudies"]["mm"]:
                    if j in major[year]:
                        if major[year][i]["attr"]["excl"] == major[year][j]["attr"]["short"]:
                            check = False
                            break
                    elif j in major[year]:
                        if major[year][i]["attr"]["excl"] == major[year][j]["attr"]["short"]:
                            check = False
                            break
            if check:
                data["prog"] = [i]
                output = checking_function_major.main(data)
                if "credit" in output[i]["respattr"]:
                    m.append([output[i]["respattr"]["credit"] / output[i]["attr"]["cred_fulfill"], output[i]["attr"]["cred_fulfill"], i])
                else:
                    m.append([0, output[i]["attr"]["cred_fulfill"], i])

    minor.sort()
    option.sort()
    ext.sort()
    m.sort()
    return minor, option, ext, m

def gradeMapping(grade):
    if grade in notPassGrade:
        return 0
    if grade in passNonLetterGrade:
        return 0.1
    match grade[0]:
        case "A":
            gpa = 4
        case "B":
            gpa = 3
        case "C":
            gpa = 2
        case "D":
            return 1
        case _:
            return 0
    if len(grade) > 1:
        match grade[1]:
            case "+":
                gpa += 0.3
            case "-":
                gpa -= 0.3
    return gpa

def semesterSort(course):
    if "courses" in user:
        if course in user["courses"]:
            sem = user["courses"][course]
            sem = sorted(sem.keys())
    return sem

