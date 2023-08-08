version = 1

import copy
from datetime import datetime
import traceback
import globalVariable
import checking_function_major
import checking_function_course

def main(request_data):
    return recommendCourses(request_data)

def recommendCourses(data):
    getUserInfo(data)
    exclusionList = getExclusion(list(user["courses"].keys()))
    recommend = []
    checkMajorOutput = checkMajor(data)
    for i in checkMajorOutput:
        temp = []
        for j in range(len(checkMajorOutput[i]["respattr"]["alternative"])):
            if checkMajorOutput[i]["respattr"]["alternative"][j][0] == 0 and checkMajorOutput[i]["respattr"]["alternative"][j][2] != -1:
                for k in checkMajorOutput[i]["respattr"]["alternative"][j][1]:
                    if k not in exclusionList and k not in temp:
                        temp.append(k)
        for j in temp:
            for k in range(len(recommend)):
                if j == recommend[k][0]:
                    recommend[k][1] += 1
                    recommend[k][2].append(i)
                    break
            recommend.append([j, 1, [i]])
    output = []
    for i in range(len(recommend)):
        o = {}
        courseCodeSep = recommend[i][0].split()
        code = courseCodeSep[0] + courseCodeSep[1]
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
        check = checking_function_course.main(data)
        o["pass"] = check[code]["pass"]
        output.append(o)
    return output

def getUserInfo(data):
    userdb = data["userdb"]
    global user
    user = copy.deepcopy(userdb)

    global creditTaken
    creditTaken = 0
    course = list(user["courses"].keys())
    if "courses" in user:
        for i in course:
            if i in user["courses"]:
                sem = sorted(user["courses"][i].keys())
                if len(sem) == 1:
                    creditTaken += int(user["courses"][i][sem[0]]["actual_cred"])
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
    return checking_function_major.main(requestCheckMajor)
    
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