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
    courseDict = {}
    getUserInfo(data)
    checkMajorOutput = checkMajor(data)
    treatedMajorOutput = treatMajor(checkMajorOutput, data)
    
    for i in treatedMajorOutput:
        courseDict[i] = {}
        courseDict[i]["mustReg"] = fulfillMajor(treatedMajorOutput[i])
        #courseDict[i]["forMCGA"] = forMCGA(treatedMajorOutput[i])
    return courseDict

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
                sem = user["courses"][i]
                sem = sorted(sem.keys())
                if len(sem) > 1:
                    creditTaken += int(user["courses"][i][sem[len(sem) - 1]]["actual_cred"])
                else:
                    creditTaken += int(user["courses"][i][sem[0]]["units"])

    current = datetime.now()
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
    monthTaken = month % 12
    
def checkMajor(data):
    requestCheckMajor = copy.deepcopy(data)
    requestCheckMajor["fx"] = "checking"
    if "prog" not in requestCheckMajor:
        requestCheckMajor["prog"] = user["profile"]["currentStudies"]["mm"]
    return checking_function_major.main(requestCheckMajor)

def treatMajor(checkMajorOutput, data):
    treatedMajorOutput = copy.deepcopy(checkMajorOutput)
    for i in checkMajorOutput:
        course = courseCheck(checkMajorOutput[i], data)
        excluded = []
        for j in course:
            if "EXCLUSION" in course[j]:
                if course[j]["EXCLUSION"]["pass"]:
                    code = j[:4]
                    code += " "
                    code += j[4:]
                    excluded.append(code)
        treatedMajor = removeExclusion(checkMajorOutput[i], excluded)
        treatedMajorOutput[i] = treatedMajor
    return treatedMajorOutput

def courseCheck(majorOutput, data):
    request = copy.deepcopy(data)
    request["course"] = []

    if majorOutput["respattr"]["alternative"]:
        for i in range(len(majorOutput["respattr"]["alternative"])):
            if majorOutput["respattr"]["alternative"][i][0] == 0 and majorOutput["respattr"]["alternative"][i][2] != -1:
                for j in range(len(majorOutput["respattr"]["alternative"][i][1])):
                    courseCodeSep = majorOutput["respattr"]["alternative"][i][1][j].split()
                    code = courseCodeSep[0] + courseCodeSep[1]
                    request["course"].append(code)        
    return checking_function_course.main(request)

def removeExclusion(major, excluded):
    if "array" in major:
        for i in major["array"]:
            major["array"][i] = removeExclusion(major["array"][i], excluded)
    if "alternative" in major["respattr"]:
        alternative = []
        for i in range(len(major["respattr"]["alternative"])):
            for j in range(len(major["respattr"]["alternative"][i][1])):
                if major["respattr"]["alternative"][i][1][j] in excluded:
                    break
                alternative.append(major["respattr"]["alternative"][i])
        if alternative != []:
            major["respattr"]["alternative"] = alternative
        else:
            del major["respattr"]["alternative"]
    return major

def fulfillMajor(treatedMajor):
    major = copy.deepcopy(treatedMajor)
    loop = loopMajor(major, False)
    return loop["respattr"]["alternative"]
    

def loopMajor(major, passattr):
    delete = []
    alternative = []
    del major["respattr"]
    if "array" in major and major["pass"] == passattr:
        for i in major["array"]:
            major["array"][i] = loopMajor(major["array"][i], passattr)
            if major["array"][i] == {}:
                delete.append(i)
            elif "respattr" in major["array"][i]:
                if "alternative" in major["array"][i]["respattr"]:
                    for j in major["array"][i]["respattr"]["alternative"]:
                        alternative.append(j)
    for i in delete:
        del major["array"][i]
    if major["pass"] != passattr:
        return {}
    elif major["action"] == "pass_course":
        major["respattr"] = {}
        major["respattr"]["alternative"] = [major["course"]]
    else:
        major["respattr"] = {}
        major["respattr"]["alternative"] = alternative
    return major

def forMCGA(treatedMajor):
    major = copy.deepcopy(treatedMajor)
    loop = loopMajor(major, True)
    mcgaUse = []
    if "alternative" in loop["respattr"]:
        for i in range(len(loop["respattr"]["alternative"])):
            mcgaUse.append(loop["respattr"]["alternative"][i])
    return mcgaUse