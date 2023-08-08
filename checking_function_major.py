version = 1

import globalVariable
import copy
import traceback

def main(request_data):
    return major_checking(request_data)

notPassGrade = ["F", "AU", "CR", "I", "PP", "W", "----"]
passNonLetterGrade = ["DI", "PA", "P", "T"]
seng = ["BIEN", "CENG", "CEEV", "CIVL", "CIEV", "CPEG",
        "COMP", "COSC", "ELEC", "IEEM", "ISDN", "MECH"]

def major_checking(request_data):
    userdb = request_data["userdb"]
    year = "20"
    year += userdb["profile"]["currentStudies"]["yearOfIntake"][0]
    year += userdb["profile"]["currentStudies"]["yearOfIntake"][1]
    output = {}
    global user
    user = copy.deepcopy(userdb)
    for i in request_data["prog"]:
        try:
            year_ = copy.deepcopy(year)
            if i not in globalVariable.major[year]:
                year_ = "0"
            if globalVariable.major[year_][i]["attr"]["type"] != "option":
                user = copy.deepcopy(userdb)
            if "specialApprovals" in user["profile"] and "selfDeclearMapping" in user["profile"]["specialApprovals"]:
                for j in user["profile"]["specialApprovals"]["selfDeclearMapping"]:
                    for k in user["profile"]["specialApprovals"]["selfDeclearMapping"][j]:
                        if user["profile"]["specialApprovals"]["selfDeclearMapping"][j][k][0][1] == globalVariable.major[year_][i]["attr"]["short"]:
                            removeCourse(k)
            recursion = priority(globalVariable.major[year_][i])
            output[i] = switch(globalVariable.major[year_][i]["action"], recursion)
            
        except Exception:
            print(traceback.format_exc())
    return output

def priority(code):
    if "array" in code:
        if "attr" in code:
            if "local_double_count" in code["attr"]:
                array = {}
                output = code
                output["pass"] = False
                output["respattr"] = {}

                check = False
                if "action" in code:
                    if code["action"] == "and":
                        check = True

                courseList = []
                alter = []
                for i in code["array"]:
                    recursion = switch(code["array"][i]["action"], code["array"][i])
                    if "action" in code:
                        if code["action"] == "and" and not recursion["pass"]:
                            check = False
                        if code["action"] == "or" and recursion["pass"]:
                            check = True

                    if recursion["respattr"]:
                        if "courseUsed" in recursion["respattr"]:
                            course = []
                            for j in range(len(recursion["respattr"]["courseUsed"])):
                                course.append(recursion["respattr"]["courseUsed"][j])
                            courseList.append([recursion["respattr"]["gpa"], course, recursion["respattr"]["credit"], recursion["respattr"]["actual_cred"]])
                        if "alternative" in recursion["respattr"]:
                            for j in range(len(recursion["respattr"]["alternative"])):
                                alter.append(recursion["respattr"]["alternative"][j])
                    array[i] = recursion

                output["array"] = array
                if check:
                    if "min_credit" in code["attr"] or "min_course" in code["attr"] or "course" in code["attr"]:
                        gpaSum, courseUsed, credit, actual_cred, alternative, output = courseRank(code["attr"], courseList, [], output)
                    else:
                        gpaSum, courseUsed, credit, actual_cred, alternative, output = bestCourse(courseList, [], output)
                    output = info(gpaSum, courseUsed, credit, actual_cred, output)

                    for i in range(len(alter)):
                        alternative.append(alter[i])
                    if alternative != []:
                        output["respattr"]["alternative"] = alternative
                return output
            
        for i in code["array"]:
            priority(code["array"][i])
    return code

def courseRank(attr, course, alter, output):
    courseCopy = []
    for i in range(len(course)):
        courseCopy.append(course[i])
    if alter != []:
        for i in range(len(alter)):
            courseCopy.append(alter[i])
    courseCopy.sort(reverse = True)

    min_credit = 0
    min_course = 0
    if "min_credit" in attr and "course" in attr:
        gpa, courseUsed, credit, actual_cred, alter, output = exact(attr, courseCopy, output)
        return gpa, courseUsed, credit, actual_cred, alter, output
    if "min_credit" in attr:
        min_credit = attr["min_credit"]
    if "min_course" in attr: 
        min_course = attr["min_course"]
    if "course" in attr:
        min_course = attr["course"]

    count = 0
    gpaSum = 0
    courseUsed = []
    credit = 0
    actual_cred = 0
    while count < len(courseCopy):
        if "max_course" in attr:
            if len(courseUsed) == attr["max_course"]:
                if credit >= min_credit:
                    output["pass"] = True
                else:
                    output["pass"] = False
                break
        
        if credit >= min_credit and len(courseUsed) >= min_course:
            output["pass"] = True
            break

        if courseCopy[count][0] == 0:
            output["pass"] = False
            break

        gpaSum += courseCopy[count][0] * course[count][3]
        for i in range(len(course[count][1])):
            courseUsed.append(course[count][1][i])
        credit += courseCopy[count][2]
        actual_cred += courseCopy[count][3]

        count += 1
    
    alternative = []
    for i in range(count, len(courseCopy)):
        alternative.append(courseCopy[i])
    
    return gpaSum, courseUsed, credit, actual_cred, alternative, output

def exact(attr, courseCopy, output):
    min_credit = attr["min_credit"]
    courseNum = attr["course"]
    suggest = min_credit / courseNum
    
    courseN = []
    gpaN = 0
    creditN = 0 
    actual_credN = 0
    count = 0
    while len(courseN) < courseNum and count < len(courseCopy):
        if courseCopy[count][2] >= suggest:
            gpaN += courseCopy[count][0] * courseCopy[count][3]
            for i in range(len(courseCopy[count][1])):
                courseN.append(courseCopy[count][1][i])
            creditN += courseCopy[count][2]
            actual_credN += courseCopy[count][3]
        count += 1

    alterN = []
    for i in range(count, len(courseCopy)):
        alterN.append(courseCopy[i])
    
    courseW = []
    gpaW = 0
    creditW = 0 
    actual_credW = 0
    extra = 0
    alterW = []
    count = 0
    while len(courseW) < courseNum and count < len(courseCopy):
        if courseCopy[count][1][0] in courseW:
            count += 1
            continue
        local = extra + courseCopy[count][2]
        if local >= suggest:
            gpaW += courseCopy[count][0] * courseCopy[count][3]
            for i in range(len(courseCopy[count][1])):
                courseW.append(courseCopy[count][1][i])
            creditW += courseCopy[count][2]
            actual_credW += courseCopy[count][3]
            extra = local - suggest
        elif courseNum - len(courseW) == 1:
            count += 1
            continue
        else:
            for i in range(count + 1, len(courseCopy)):
                if courseCopy[i][2] + courseCopy[count][2] >= suggest * 2:
                    gpaW += courseCopy[count][0] * courseCopy[count][3] + courseCopy[i][0] * courseCopy[i][3]
                    for j in range(len(courseCopy[count][1])):
                        courseW.append(courseCopy[count][1][j])
                    for j in range(len(courseCopy[i][1])):
                        courseW.append(courseCopy[i][1][j])
                    creditW += courseCopy[count][2] + courseCopy[i][2]
                    actual_credW += courseCopy[count][3] + courseCopy[i][3]
                    break
                if i == len(courseCopy) - 1:
                    alterW.append(courseCopy[count])
        count += 1

    for i in range(count, len(courseCopy)):
        if courseCopy[i][1][0] not in courseW:
            alterW.append(courseCopy[i])

    n = False
    w = False
    if len(courseN) == courseNum and creditN >= min_credit:
        n = True
    if len(courseW) == courseNum and creditW >= min_credit:
        w = True

    output["pass"] = True
    if n and w:
        if gpaN > gpaW:
            gpa = gpaN
            courseUsed = courseN
            credit = creditN
            actual_cred = actual_credN
            alter = alterN
        else:
            gpa = gpaW
            courseUsed = courseW
            credit = creditW
            actual_cred = actual_credW
            alter = alterW
    elif n:
        gpa = gpaN
        courseUsed = courseN
        credit = creditN
        actual_cred = actual_credN
        alter = alterN
    elif w:
        gpa = gpaW
        courseUsed = courseW
        credit = creditW
        actual_cred = actual_credW
        alter = alterW
    else:
        output["pass"] = False
        gpa = 0
        courseUsed = []
        credit = 0
        actual_cred = 0
        alter = courseCopy

    return gpa, courseUsed, credit, actual_cred, alter, output

def switch(action, code):
    output = code
    if "attr" in code:
        if "local_double_count" in code["attr"]:
            return output
        
    output["pass"] = False
    output["respattr"] = {}
    match action:
        case "and":
            course, alter, check = loop(output)

            check2 = True
            if "attr" in code:
                if "min_course" in code["attr"] or "min_credit" in code["attr"] or "course" in code["attr"]:
                    check2 = False
                    gpaSum, courseUsed, credit, actual_cred, alternative, output = courseRank(code["attr"], course, alter, output)
            if check2:
                gpaSum = 0
                courseUsed = []
                credit = 0
                actual_cred = 0
                for count in range(len(course)):
                    gpaSum += course[count][0] * course[count][3]
                    for i in range(len(course[count][1])):
                        courseUsed.append(course[count][1][i])
                    credit += course[count][2]
                    actual_cred += course[count][3]
                
                alternative = []
                for i in range(len(alter)):
                    alternative.append(alter[i])

            output["pass"] = check
            output = info(gpaSum, courseUsed, credit, actual_cred, output)
            if alternative != []:
                output["respattr"]["alternative"] = alternative
            removeCourse(courseUsed)
            return output
        
        case "or":
            course, alter, check = loop(output)

            alternative = []
            if check:
                check2 = True
                if "attr" in code:
                    if "min_course" in code["attr"] or "min_credit" in code["attr"] or "course" in code["attr"]:
                        check2 = False
                        gpaSum, courseUsed, credit, actual_cred, alternative, output = courseRank(code["attr"], course, alter, output)
                if check2:
                    gpaSum, courseUsed, credit, actual_cred, alternative, output = bestCourse(course, alter, output)

                output = info(gpaSum, courseUsed, credit, actual_cred, output)
                removeCourse(courseUsed)
            else:
                alternative = alter
            
            if alternative != []:
                output["respattr"]["alternative"] = alternative
            return output
        
        case "not":
            for i in range(len(output["note"])):
                recursion = switch(output["note"][i]["action"], output["note"][i])
                if not recursion["pass"]:
                    output["pass"] = True
                elif "courseUsed" in recursion["respattr"]:
                    output["respattr"]["blackList"] = recursion["respattr"]["courseUsed"]
            return output
        
        case "spread":
            courseAllArea = []
            crossArea = []
            course = []
            for i in code["attr"]["array"]:
                areaCourseList, areaAlterList, check = loop(code["attr"]["array"][i])
                
                areaCourseList.sort()
                areaCredit = 0
                areaGPA = 0
                for j in range(len(areaCourseList)):
                    for k in range(len(areaCourseList[j][1])):
                        if areaCourseList[j][1][k] in courseAllArea:
                            crossArea.append(areaCourseList[j][1][k])
                        else:
                            courseAllArea.append(areaCourseList[j][1][k])
                    areaCredit += areaCourseList[j][2]
                    areaGPA += areaCourseList[j][0] * areaCourseList[j][3]
                course.append([areaCredit, areaGPA, areaCourseList, areaAlterList, i])
            
            if "min_course_spread" in code["attr"]:
                for i in range(len(course)):
                    course[i][0] = len(course[i][2])

            gpaSum, courseUsed, credit, actual_cred, output = spread(code["attr"], course, crossArea, output)
            output = info(gpaSum, courseUsed, credit, actual_cred, output)
            removeCourse(courseUsed)
            return output
            
        case "pass_course":
            credit, output = creditFind(code["course"], output)
            if "courses" in user:
                if code["course"] not in user["courses"]:
                    sub = []
                    canUse = []
                    courseCodeSep = code["course"].split()
                    courseCode = courseCodeSep[0] + courseCodeSep[1]
                    for i in globalVariable.courseids:
                        if courseCode == i:
                            output["respattr"]["alternative"] = [[0, [code["course"]], credit, 0]]
                            return output
                        elif courseCode in i:
                            sub.append(i)
                    for i in sub:
                        courseCode = i[:4] + " " + i[4:]
                        if courseCode in user["courses"]:
                            gpa, credit, actual_cred, output = courseInfo(courseCode, output)
                            canUse.append([gpa, [courseCode], credit, actual_cred])
                    if canUse == []:
                        output["respattr"]["alternative"] = [[0, [code["course"]], credit, 0]]
                        return output
                    else:
                        canUse.sort(reverse = True)
                        output = info(canUse[0][0] * canUse[0][3], canUse[0][1], canUse[0][2], canUse[0][3], output)
                        output["pass"] = True
                else:               
                    gpa, credit, actual_cred, output = courseInfo(code["course"], output)
                    output = info(gpa * actual_cred, [code["course"]], credit, actual_cred, output)
                    output["pass"] = True
            else:
                output["respattr"]["alternative"] = [[0, [code["course"]], credit, 0]]
            return output
        
        case "pass_certain_level":
            deptList = []
            if "school" in code:
                match code["school"]:
                    case "SENG":
                        for i in seng:
                            deptList.append(i)

                    case _:
                        output["respattr"]["error"] = "Invalid_school"
                        return output
            

            if "dept" in code:
                for i in code["dept"]:
                    deptList.append(i)

            exclusion = []  
            if "attr" in code:
                if "excl" in code["attr"]:
                    if "dept" in code["attr"]["excl"]:
                        for i in code["attr"]["excl"]["dept"]:
                            if i in deptList:
                                deptList.remove(i)
                    elif "course" in code["attr"]["excl"]:
                        for i in code["attr"]["excl"]["course"]:
                            exclusion.append(i)

            course = []
            alter = []
            if "courses" in user:
                for i in user["courses"]:
                    if i in exclusion:
                        continue
                    courseCodeSep = i.split()
                    dept = courseCodeSep[0]
                    if dept not in deptList:
                        continue
                    numeric = ""
                    for j in range(4):
                        numeric += courseCodeSep[1][j]
                    level = int(numeric)
                    if level < code["level"]:
                        continue

                    gpa, credit, actual_cred, output = courseInfo(i, output)

                    if gpa:
                        course.append([gpa, [i], credit, actual_cred])
                    else:
                        alter.append([gpa, [i], credit, actual_cred])
            else:
                return output
            
            check2 = True
            if "attr" in code:
                if "min_course" in code["attr"] or "min_credit" in code["attr"] or "course" in code["attr"]:
                    check2 = False
                    gpaSum, courseUsed, credit, actual_cred, alternative, output = courseRank(code["attr"], course, alter, output)
            if check2:
                gpaSum, courseUsed, credit, actual_cred, alternative, output = bestCourse(course, alter, output)

            output = info(gpaSum, courseUsed, credit, actual_cred, output)
            if alternative != []:
                output["respattr"]["alternative"] = alternative
            return output
        
        case "pass_qualification":
            if "pastQuali" not in user["profile"] or code["quali"][0] not in user["profile"]["pastQuali"] or code["quali"][1] not in user["profile"]["pastQuali"][code["quali"][0]]:
                return output
            output = qualiMapping(code["quali"][0], code["level"], user["profile"]["pastQuali"][code["quali"][0]][code["quali"][1]], output)
            return output
        
        case "approval":
            if "specialApprovals" not in user["profile"] or"selfDeclear" not in user["profile"]["specialApprovals"] or code["note"] not in user["profile"]["specialApprovals"]["selfDeclear"]:
                return output
            output["pass"] = True
            return output

        case "is_major":
            if "attr" in code:
                if "major" in code["attr"]:
                    for i in code["attr"]["major"]:
                        if "currentStudies" in user:
                            if "mm" in user["currentStudies"]:
                                if i in user["currentStudies"]["mm"]:
                                    output["pass"] = True
                            else:
                                output["respattr"]["error"] = "mm_not_found_in_currentStudies"
                        else:
                            output["respattr"]["error"] = "currentStudies_not_found_in_userdb"
            return output
        
        case _:
            output["respattr"]["error"] = "Invalid_action"
            return output

def creditFind(course, output):
    courseCodeSep = course.split()
    code = courseCodeSep[0] + courseCodeSep[1]

    if code in globalVariable.courseids:
        courseName = globalVariable.courseids[code]["NAME"]
        courseid = globalVariable.courseids[code]["COURSEID"]
        locater = courseid.find(courseName) + len(courseName) + 2
    else:
        output["respattr"]["error"] = "Course_not_found_in_coursids"
        return -1, output

    if locater >= len(courseid):
        return -1, output
    elif courseid[locater].isnumeric():
        return int(courseid[locater]), output
    else:
        locater += 1

def qualiMapping(exam, gradeQ, gradeU, output):
    match exam:
        case "HKDSE":
            level = ["5**", "5*", "5", "4", "3", "2", "1", "U"]

        case _:
            output['respattr']["error"] = "Invalid_examinationType"
            return output


    for i in level:
        if i == gradeU:
            output["pass"] = True
            return output
        if i == gradeQ:
            return output
        
def semesterSort(course, output):
    if "courses" in user:
        if course in user["courses"]:
            sem = user["courses"][course]
            sem = sorted(sem.keys())
        else:
            sem = {}
            output["respattr"]["error"] = "Course_not_found"
        return sem, output
    else:
        return {}, output

def gradeMapping(grade, output):
    if grade in notPassGrade:
        return 0, output
    if grade in passNonLetterGrade:
        return 0.1, output
    match grade[0]:
        case "A":
            gpa = 4
        case "B":
            gpa = 3
        case "C":
            gpa = 2
        case "D":
            return 1, output
        case _:
            output["respattr"]["error"] = "Invalid_grade_received"
            return 0, output
    if len(grade) > 1:
        match grade[1]:
            case "+":
                gpa += 0.3
            case "-":
                gpa -= 0.3
    return gpa, output

def courseInfo(course, output):
    sem, output = semesterSort(course, output)
    grade = user["courses"][course][sem[len(sem) - 1]]["grade"]
    gpa, output = gradeMapping(grade, output)

    if len(sem) > 1:
        credit = int(user["courses"][course][sem[len(sem) - 1]]["units"])
    else:
        credit = int(user["courses"][course][sem[0]]["units"])
    if gpa == 0.1:
        actual_cred = 0
    else:
        actual_cred = credit

    return gpa, credit, actual_cred, output

def loop(code):
    blackList = []
    courseList = []
    alter = []
    check = False
    if "action" in code:
        if code["action"] == "and":
            check = True

    for i in ["approval", "not", "is major", "pass_qualification", "pass_course", "and", "or", "spread", "pass_certain_level"]:
        for j in code["array"]:
            if code["array"][j]["action"] == i:
                if "attr" in code:
                    if "local_double_count" in code["attr"]:
                        continue

                recursion = switch(i, code["array"][j])
                if "action" in code:
                    if code["action"] == "and" and not recursion["pass"]:
                        check = False
                    if code["action"] == "or" and recursion["pass"]:
                        check = True

                if "blackList" in recursion["respattr"]:
                    blackList.append(recursion["respattr"]["blackList"])
                    continue

                if recursion["respattr"]:
                    if "courseUsed" in recursion["respattr"]:
                        course = []
                        for k in range(len(recursion["respattr"]["courseUsed"])):
                            course.append(recursion["respattr"]["courseUsed"][k])
                        courseList.append([recursion["respattr"]["gpa"], course, recursion["respattr"]["credit"], recursion["respattr"]["actual_cred"]])
                    
                    if "alternative" in recursion["respattr"]:
                        for k in range(len(recursion["respattr"]["alternative"])):
                            alter.append(recursion["respattr"]["alternative"][k])
                           
    return courseList, alter,check

def bestCourse(course, alter, output):
    gpaSum = 0
    courseUsed = []
    alternative = []
    credit = 0
    actual_cred = 0

    if course:
        course.sort(reverse = True)
        gpaSum = course[0][0] * course[0][3]
        for i in range(len(course[0][1])):
            courseUsed.append(course[0][1][i])
        credit = course[0][2]
        actual_cred = course[0][3]

        del course[0]
        for i in range(len(course)):
            if course[i] != []:
                alternative.append(course[i])
        for i in range(len(alter)):
            if alter != []:
                alternative.append(alter[i])

        if courseUsed != []:
            output["pass"] = True
    return gpaSum, courseUsed, credit, actual_cred, alternative, output

def info(gpaSum, courseUsed, credit, actual_cred, output):
    if courseUsed != []:
        if actual_cred:
            output["respattr"]["gpa"] = gpaSum / actual_cred
        else:
            output["respattr"]["gpa"] = 0.1
        output["respattr"]["courseUsed"] = courseUsed
        output["respattr"]["credit"] = credit
        output["respattr"]["actual_cred"] = actual_cred

    return output

def removeCourse(course):
    if course != []:
        for i in range(len(course)):
            if course[i] in user["courses"]:
                del user["courses"][course[i]]
    
def spread(attr, course, crossArea, output):
    course.sort(reverse = True)
    alter = []
    check = True
    areaInfo = []
    courseUsed = []
    crossAreaUsed = []
    creditArea = 0
    creditSum = 0

    if "min_course_spread" in attr:
        rank = attr["min_course_spread"]
    elif "min_credit_spread" in attr:
        rank = attr["min_credit_spread"]

    for i in range(len(rank)):
        for j in range(len(course[i][3])):
            alter.append(course[i][3][j])
        if course[i][0] < rank[i]:
            check = False
            continue
        if check:
            depend = []
            for j in range(len(course[i][2])):
                if course[i][2][j] in crossAreaUsed:
                    continue
                elif course[i][2][j] in crossArea:
                    depend.append(course[i][2][j])
                    continue
                else:
                    courseUsed.append(course[i][2][j])
                creditArea += course[i][2][j][0]

            if "min_course_spread" in attr:
                for k in range(len(depend)):
                    if len(courseUsed) < rank[i]:
                        courseUsed.append(depend[0])
                        crossAreaUsed.append(depend.pop(0))
                if len(courseUsed) < rank[i]:
                    break
            elif "min_credit_spread" in attr:
                for k in range(len(depend)):
                    if creditArea < rank[i]:
                        creditArea += depend[0][0]
                        courseUsed.append(depend[0])
                        crossAreaUsed.append(depend.pop(0))
                if len(courseUsed) < rank[i]:
                    break
    
            areaInfo.append(course[i][4])
            for k in range(j, len(course[i][2])):
                alter.append(course[i][2][k])

    for i in range(len(crossArea)):
        if crossArea[i] not in crossAreaUsed:
            alter.append(crossArea[i])
    alter.sort(reverse = True)

    if check:
        min_credit = 1
        min_course = 1
        if "min_credit" in attr:
            min_credit = attr["min_credit"]
        if "min_course" in attr:
            min_course = attr["min_course"]
        if "course" in attr:
            min_course = attr["course"]

        while len(courseUsed) < min_course:
            if alter[0][1] == 0:
                output["pass"] = False
                break
            creditSum += alter[0][0]
            courseUsed.append(alter.pop(0))
        while creditSum < min_credit:
            if alter[0][1] == 0 or alter != []:
                output["pass"] = False
                break
            creditSum += alter[0][0]
            courseUsed.append(alter.pop(0))
        output["pass"] = True
    else:
        output["pass"] = False

    gpaSum = 0
    courseUsedR = []
    credit = 0
    actual_cred = 0
    for i in range(len(courseUsed)):
        gpaSum += courseUsed[i][0] * courseUsed[i][3]
        for j in range(len(courseUsed[i][1])):
            courseUsedR.append(courseUsed[i][1][j])
        credit += courseUsed[i][2]
        actual_cred += courseUsed[i][3]

    output["respattr"]["areaInfo"] = areaInfo
    if alter != []:
        output["respattr"]["alternative"] = alter
    return gpaSum, courseUsedR, credit, actual_cred, output