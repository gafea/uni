version = 1

import copy
from datetime import datetime
import traceback
import globalVariable
import checking_function_major
import checking_function_course

notPassGrade = ["F", "AU", "CR", "I", "PP", "W", "----"]

def main(data):
    getUserInfo(data)
    exclusionList = []
    if "courses" in user:
        exclusionList = getExclusion(list(user["courses"].keys()))
    recommend = []
    checkMajorOutput = checkMajor(data)
    mcgaCourse = []
    for i in checkMajorOutput:
        a = forMCGA(checkMajorOutput[i], False)
        if a["respattr"]["mcgaCourse"] != []:
            for j in a["respattr"]["mcgaCourse"]:
                mcgaCourse.append(j)
    for i in checkMajorOutput:
        temp = []
        if "alternative" in checkMajorOutput[i]["respattr"]:
            for j in range(len(checkMajorOutput[i]["respattr"]["alternative"])):
                if checkMajorOutput[i]["respattr"]["alternative"][j][0] == 0 and checkMajorOutput[i]["respattr"]["alternative"][j][2] != -1:
                    for k in checkMajorOutput[i]["respattr"]["alternative"][j][1]:
                        if k not in exclusionList and k not in temp and checkInSem(k) and k not in mcgaCourse:
                            if k in user["courses"]:
                                sem = user["courses"][k]
                                sem = sorted(sem.keys())
                                if user["courses"][k][sem[len(sem) - 1]]["grade"] not in notPassGrade:
                                    continue
                            temp.append(k)
        for j in temp:
            check = True
            for k in range(len(recommend)):
                if j == recommend[k][0]:
                    recommend[k][1] += 1
                    recommend[k][2].append(i)
                    check = False
                    break
            if check:
                recommend.append([j, 1, [i]])
    output = []
    for i in range(len(recommend)):
        courseCodeSep = recommend[i][0].split()
        code = courseCodeSep[0] + courseCodeSep[1]
        o = {}
        o["code"] = code
        o["matches"] = recommend[i][1]
        o["matched_by"] = recommend[i][2]
        if code in globalVariable.courseids:
            courseName = globalVariable.courseids[code]["NAME"]
            courseid = globalVariable.courseids[code]["COURSEID"]
            locater = courseid.find(courseName) + len(courseName) + 2
        o["name"] = globalVariable.courseids[code]["NAME"]
        o["sem"] = globalVariable.insems[code][len(globalVariable.insems[code]) - 1]
        o["units"] = int(courseid[locater])
        data["course"] = [code]
        if "prog" not in data:
            data["prog"] = user["profile"]["currentStudies"]["mm"]
        check = copy.deepcopy(checking_function_course.main(data))
        if "CO-REQUISITE" in check[code]:
            if not check[code]["CO-REQUISITE"]["pass"]:
                continue
        elif not check[code]["pass"]:
            continue
        if "attr" in check:
            if "error" in check["attr"]:
                globalVariable.deathDump("uni.gafea.net@7003", "recommend-course crashed when calling checkin_function_courses", "Invalid input by " + code + ".")
                continue
        o["pass"] = check[code]["pass"]
        output.append(o)
    return output

def getUserInfo(data):
    userdb = data["userdb"]
    global user
    user = copy.deepcopy(userdb)

    global creditTaken
    creditTaken = 0
    
    if "courses" in user:
        course = list(user["courses"].keys())
        for i in course:
            if i in user["courses"]:
                sem = sorted(user["courses"][i].keys())
                if len(sem) == 1:
                    creditTaken += int(user["courses"][i][sem[0]]["units"])
                else:
                    creditTaken += int(user["courses"][i][sem[len(sem) - 1]]["units"])

    current = datetime.now()
    global currentYear
    currentYear = current.year % 2000 - int(int(user["profile"]["currentStudies"]["yearOfIntake"]) / 100)
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
    currentYear += month / 12
    monthTaken = month % 12

    global currentSem
    if monthTaken:
        if monthTaken <= 4:
            currentSem = "10"
        elif monthTaken <= 6:
            currentSem = "20"
        elif monthTaken <= 10:
            currentSem = "30"
        else:
            currentSem = "40"
    else:
        currentSem = "00"

def checkMajor(data):
    requestCheckMajor = copy.deepcopy(data)
    requestCheckMajor["fx"] = "checking"
    if "prog" not in requestCheckMajor:
        requestCheckMajor["prog"] = user["profile"]["currentStudies"]["mm"]
    output = copy.deepcopy(checking_function_major.main(requestCheckMajor))
    return output
    
def getExclusion(course):
    excl = []
    for i in course:
        coursecodeSep = i.split()
        coursecode = coursecodeSep[0] + coursecodeSep[1]
        if coursecode in globalVariable.arrange_PCG:
            if globalVariable.arrange_PCG[coursecode]["EXCLUSION-BY"] != []:
                for j in globalVariable.arrange_PCG[coursecode]["EXCLUSION-BY"]:
                    code = j[:4]
                    code += " "
                    code += j[4:]
                    excl.append(code)
    return excl    

def checkInSem(course):
    courseCodeSep = course.split()
    code = courseCodeSep[0] + courseCodeSep[1]
    sem = copy.deepcopy(globalVariable.insems[code])
    sem.sort(reverse = True)
    current = datetime.now()
    if int(sem[0][:2]) < current.year % 2000 - 4:
        return False
    return True

def forMCGA(major, passattr):
    mcgaCourse = []
    major["respattr"]["mcgaCourse"] = []
    if "array" in major:
        for i in major["array"]:
            recursion = forMCGA(major["array"][i], passattr)
            if recursion["respattr"]["mcgaCourse"] != []:
                for j in range(len(recursion["respattr"]["mcgaCourse"])):
                    major["respattr"]["mcgaCourse"].append(recursion["respattr"]["mcgaCourse"][j])
    if major["pass"] != passattr:
        if "alternative" in major["respattr"]:
            for j in range(len(major["respattr"]["alternative"])):
                for k in range(len(major["respattr"]["alternative"][j][1])):
                    mcgaCourse.append(major["respattr"]["alternative"][j][1][k])
        major["respattr"]["mcgaCourse"] = mcgaCourse
    return major