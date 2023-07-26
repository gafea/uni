version = 1

import globalVarible
import copy

def main(request_data):
    return splitter(request_data)

def splitter(request_data):
    if "course" in request_data:
        return course_checking(request_data)
    else:
        return major_checking(request_data)
    
def course_checking(request_data):
    return False

##############################
notPassGrade = ["F", "AU", "CR", "I", "PP", "W"]
seng = ["BIEN", "CENG", "CEEV", "CIVL", "CIEV", "CPEG",
        "COMP", "COSC", "ELEC", "IEEM", "ISDN", "MECH"]

def major_checking(request_data):
    userdb = request_data["userdb"]
    year = "20"
    year += userdb["profile"]["currentStudies"]["yearOfIntake"][0]
    year += userdb["profile"]["currentStudies"]["yearOfIntake"][1]
    output = {}
    for i in request_data["prog"]:
        if globalVarible.major[year][i]["attr"]["type"] != "option":
            global user
            user = copy.deepcopy(userdb)
        recursion = switch(globalVarible.major[year][i]["action"], globalVarible.major[year][i])
        output[i] = recursion
    return output

def semesterSort(course):
    sem = user["courses"][course]
    sem = sorted(sem.keys())
    return sem

def gradeMapping(grade):
    if grade in notPassGrade:
        return 0
    match grade[0]:
        case "A":
            gpa = 4
        case "B":
            gpa = 3
        case "C":
            gpa = 2
        case "D":
            gpa = 1
        case _:
            return 0.1
    if len(grade) <= 1:
        return gpa
    match grade[1]:
        case "+":
            gpa += 0.3
        case "-":
            gpa -= 0.3
    return gpa

def qualiMapping(exam, gradeQ, gradeU):
    match exam:
        case "HKDSE":
            level = ["5**", "5*", "5", "4", "3", "2", "1", "U"]

        case _:
            return False

    for i in level:
        if i == gradeU:
            return True
        if i == gradeQ:
            return False

def loop(code, output):
    check = True
    alter = []
    course = []
    for i in ["approval", "pass_qualification", "pass_course", "and", "or", "spread", "not", "pass_certain_level"]:
        for j in code["array"]:
            if code["array"][j]["action"] == i:
                recursion = switch(i, code["array"][j])
                if not recursion["pass"]:
                    check = False
                if "attr" in code:
                    if "local_double_count" in code["attr"]:
                        if recursion["pass"]:
                            output["pass"] = True
                        output["respattr"]["alter"] = recursion["respattr"]["courseUsed"]
                        return [], [], check, output
                if "alter" in recursion["respattr"]:
                    if recursion["respattr"]["alter"] != []:
                        if type(recursion["respattr"]["alter"][0]) == list:
                            for k in range(len(recursion["respattr"]["alter"])):
                                alter.append(recursion["respattr"]["alter"][k])
                        else:
                            alter.append(recursion["respattr"]["alter"])
                if "courseUsed" not in recursion["respattr"]:
                    continue
                localCourse = []
                for k in range(len(recursion["respattr"]["courseUsed"])):
                    localCourse.append(recursion["respattr"]["courseUsed"][k])

                if "gpa" in recursion["respattr"]:
                    gpa = recursion["respattr"]["gpa"]
                else:
                    gpa = 0
                if "credit" in recursion["respattr"]:
                    credit = recursion["respattr"]["credit"]
                else:
                    credit = 0
                if "actual_cred" in recursion["respattr"]:
                    actual_cred = recursion["respattr"]["actual_cred"]
                else:
                    actual_cred = 0
                course.append([gpa, localCourse, credit, actual_cred])
    
    return course, alter, check, False
      
def courseRank(code, course, alter, output):
    min_credit = 1
    min_course = 1
    if "attr" in code:
        if "min_credit" in code['attr'] and "course" in code["attr"]:
            gpa, courseUsed, credit, actual_cred, alter, output = exact(code["attr"], course, alter, output)
            return gpa, courseUsed, credit, actual_cred, alter, output
        if "min_credit" in code["attr"]:
            min_credit = code["attr"]["min_credit"]
        if "min_course" in code["attr"]: 
            min_course = code["attr"]["min_course"]
        if "course" in code["attr"]:
            min_course = code["attr"]["course"]

    gpa = 0
    courseUsed = []
    credit = 0
    actual_cred = 0

    course.sort()
    count = len(course) - 1      
    while count >= 0:
        if "attr" in code:
            if "max_course" in code["attr"]:
                if len(courseUsed) == code["attr"]["max_course"]:
                    break

        if credit >= min_credit and len(courseUsed) >= min_course:
            output["pass"] = True
            break
        
        gpa += course[count][0] * course[count][3]
        for i in range(len(course[count][1])):
            courseUsed.append(course[count][1][i])
        credit += course[count][2]
        actual_cred += course[count][3]
        count -= 1
    
    alternative = []
    for i in range(len(alter)):
        alternative.append(alter[i])
    count2 = len(alter) - 1
    while count2 >= 0:
        if "attr" in code:
            if "max_course" in code["attr"]:
                if len(courseUsed) == code["attr"]["max_course"]:
                    break
        
        if credit >= min_credit and len(courseUsed) >= min_course:
            output["pass"] = True
            break
        break  
    
    alter = []
    for i in range(count, -1, -1):
        alter.append(course[i])
    for i in range(count2, -1, -1):
        alter.append(alternative[i])
    
    return gpa, courseUsed, credit, actual_cred, alter, output

def info(gpa, courseUsed, credit, actual_cred, output):
    if actual_cred != 0:
        output["respattr"]["gpa"] = gpa / actual_cred
    elif courseUsed != []:
        output["respattr"]["gpa"] = 0

    if courseUsed != []:
        output["respattr"]["courseUsed"] = courseUsed
        output["respattr"]["credit"] = credit
        output["respattr"]["actual_cred"] = actual_cred
    return output

def spread(attr, course, output):
    course.sort(reverse = True)
    check = True
    areaInfo = []
    courseUsed = []
    alter = []
    credit = 0

    if "min_course_spread" in attr:
        rank = attr["min_course_spread"]
    elif "min_credit_spread" in attr:
        rank = attr["min_credit_spread"]

    for i in range(len(rank)):
        for j in range(len(course[i][3])):
            alter.append(course[i][3][j])
        if course[i][0] < rank[i]:
            check = False
            break
        if check:
            areaInfo.append(course[i][4])
            for j in range(len(course[i][2])):
                courseUsed.append(course[i][2][j])
                credit += course[i][2][j][0]
            for k in range(j, len(course[i][2])):
                alter.append(course[i][2][k])

    output["respattr"]["areaInfo"] = areaInfo
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
            if alter[0][0] == 0:
                output["pass"] = False
                break
            courseUsed.append(alter.pop(0))
        while credit < min_credit:
            if alter[0][0] == 0:
                output["pass"] = False
                break
            credit += alter[0][0]
            courseUsed.append(alter.pop(0))
        output["pass"] = True
    else:
        output["pass"] = False

    output["respattr"]["alter"] = alter
    gpa = 0
    courseUsedR = []
    credit = 0
    actual_cred = 0
    for i in range(len(courseUsed)):
        gpa += courseUsed[i][0] * courseUsed[i][3]
        for j in range(len(courseUsed[i][1])):
            courseUsedR.append(courseUsed[i][1][j])
        credit += courseUsed[i][2]
        actual_cred += courseUsed[i][3]

    return gpa, courseUsedR, credit, actual_cred, output

def removeCourse(course):
    for i in range(len(course)):
        if course[i] in user["courses"]:
            del user["courses"][course[i]]

def exact(attr, course, alter, output):
    min_credit = attr["min_credit"]
    courseNum = attr["course"]
    suggest = min_credit / courseNum

    courseCopy = []
    for i in range(len(course)):
        courseCopy.append(course[i])
    for i in range(len(alter)):
        courseCopy.append(alter[i])
    courseCopy.sort(reverse = True)
    
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
        else:
            if courseNum - len(courseW) == 1:
                count += 1
                continue
            for i in range(count, len(courseCopy)):
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
        alter = []

    return gpa, courseUsed, credit, actual_cred, alter, output

def switch(action, code):
    output = code
    output["pass"] = False
    output["respattr"] = {}
    output["respattr"]["error"] = "JKisHandsome"
    match action:
        case "and":
            course, alter, check, copy = loop(code, output)
            if copy:
                return copy

            check2 = True
            if "attr" in code:
                if "min_course" in code["attr"] or "min_credit" in code["attr"] or "course" in code["attr"]:
                    check2 = False
                    gpa, courseUsed, credit, actual_cred, alter, output = courseRank(code, course, alter, output)
            if check2:
                gpa = 0
                courseUsed = []
                credit = 0
                actual_cred = 0
                for count in range(len(course)):
                    gpa += course[count][0] * course[count][3]
                    for i in range(len(course[count][1])):
                        courseUsed.append(course[count][1][i])
                    credit += course[count][2]
                    actual_cred += course[count][3]

            if not check:
                output["pass"] = False
            else:
                output["pass"] = True
            output = info(gpa, courseUsed, credit, actual_cred, output)
            if alter != []:
                output["respattr"]["alter"] = alter
            removeCourse(courseUsed)
            return output
        
        case "or":
            course, alter, check, copy = loop(code, output)
            if copy:
                return copy
            
            gpa, courseUsed, credit, actual_cred, alter, output = courseRank(code, course, alter, output)
            output = info(gpa, courseUsed, credit, actual_cred, output)
            if alter != []:
                output["respattr"]["alter"] = alter
            removeCourse(courseUsed)
            return output
        
        case "not":
            output["respattr"]["courseUsed"] = []
            for i in range(len(code["array"])):
                recursion = switch(code["array"][i]["action"], code["array"][i])
                if recursion["pass"]:
                    output["pass"] = False
                    del recursion["respattr"]["courseUsed"]
                else:
                    output["pass"] = True
                    del recursion["respattr"]["alter"]
            return output
        
        case "spread":
            course = []
            for i in code["attr"]["array"]:
                areaCourseList, areaAlterList, check, copy = loop(code["attr"]["array"][i], output)
                if copy:
                    return copy
                
                areaCourseList.sort()
                areaCredit = 0
                areaGPA = 0
                for j in range(len(areaCourseList)):
                    areaCredit += areaCourseList[j][2]
                    areaGPA += areaCourseList[j][0] * areaCourseList[j][3]
                course.append([areaCredit, areaGPA, areaCourseList, areaAlterList, i])
            
            if "min_course_spread" in code["attr"]:
                for i in range(len(course)):
                    course[i][0] = len(course[i][2])

            gpa, courseUsed, credit, actual_cred, output = spread(code["attr"], course, output)
            output = info(gpa, courseUsed, credit, actual_cred, output)
            removeCourse(courseUsed)
            return output
            
        case "pass_course":
            if code["course"] not in user["courses"]:
                output["respattr"]["alter"] = [0, [code["course"]], "credit"]
                return output
            sem = semesterSort(code["course"])
            grade = user["courses"][code["course"]][sem[len(sem) - 1]]["grade"]
            gpa = gradeMapping(grade)
            if gpa == 0:
                output["respattr"]["alter"] = [0, [code["course"]], "credit"]
                return output
            output["pass"] = True
            credit = int(user["courses"][code["course"]][sem[len(sem) - 1]]["actual_cred"])
            output["respattr"]["gpa"] = gpa
            output["respattr"]["courseUsed"] = [code["course"]]
            output["respattr"]["credit"] = credit
            output["respattr"]["actual_cred"] = credit
            if gpa == 0.1:
                output["respattr"]["actual_cred"] = 0
            return output
        
        case "pass_certain_level":
            deptList = []
            if "school" in code:
                match code["school"]:
                    case "SENG":
                        deptList = seng

                    case _:
                        return output
            
            if "dept" in code:
                deptList.append(code["dept"])
            if "attr" in code:
                if "excl" in code["attr"]:
                    for i in code["attr"]["excl"]:
                        if i in deptList:
                            deptList.remove(i)

            course = []
            for i in user["courses"]:
                courseCodeSep = i.split()
                dept = courseCodeSep[0]
                if dept not in deptList:
                    continue
                level = courseCodeSep[1]
                if level < code["level"]:
                    continue
                sem = semesterSort(i)
                grade = user["courses"][i][sem[len(sem) - 1]]["grade"]
                gpa = gradeMapping(grade)
                credit = int(user["courses"][i][sem[len(sem) - 1]]["actual_cred"])
                if gpa == 0.1:
                    actual_cred = 0
                else:
                    actual_cred = credit
                course.append([gpa, [i], credit, actual_cred])
            alter = []

            gpa, courseUsed, credit, actual_cred, alter, output = courseRank(code, course, alter, output)
            
            output = info(gpa, courseUsed, credit, actual_cred, output)
            if alter != []:
                output["respattr"]["alter"] = alter
            return output
        
        case "pass_qualification":
            if code["quali"][0] not in user["profile"]["pastQuali"] or code["quali"][1] not in user["profile"]["pastQuali"][code["quali"][0]] or not qualiMapping(code["quali"][0], code["level"], user["profile"]["pastQuali"][code["quali"][0]][code["quali"][1]]):
                return output
            output["pass"] = True
            return output
        
        case "approval":
            if "specialApprovals" not in user["profile"] or "selfDeclear" not in user["profile"]["specialApprovals"] or code["note"] not in user["profile"]["specialApprovals"]["selfDeclear"]:
                return output
            output["pass"] = True
            return output