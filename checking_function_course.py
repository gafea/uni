##############################
# version number
##############################
version = 1

##############################
# globalVariable
##############################
import globalVariable
import copy

targetAttr = ["PRE-REQUISITE", "EXCLUSION", "CO-REQUISITE"]

##############################
# main
##############################
def main(request_data):
    return course_checking(request_data)

##############################
# course checking
##############################
def course_checking(request_data):
    
    check_data = {} 
    is_failattr = False
    # Receive course requirement base on request
    for course in request_data["course"]:
        if course in globalVariable.phrased_course[globalVariable.insems[course][len(globalVariable.insems[course])-1]]:
            check_data[course] = copy.deepcopy(globalVariable.phrased_course[globalVariable.insems[course][len(globalVariable.insems[course])-1]][course])
        else:
            check_data[course] = {"pass":True}
            
    # Check all courses in check_data
    for course in check_data:
        try:
            for attr in targetAttr:
                if attr in check_data[course]:
                    if "pass" in check_data[course][attr]:
                        continue
                    check_data[course][attr] = course_action_checking(check_data[course][attr], request_data["userdb"], attr, check_data[course],is_failattr, request_data)
        
            if "pass" in check_data[course]:
                if request_data["userdb"]["studyProgram"] == "UG" and int(course[5:]) >= 5000:
                    check_data[course]["pass"] = False
                if request_data["userdb"]["studyProgram"] == "PG" and int(course[5:]) < 5000:
                    check_data[course]["pass"] = False
                continue
            
            if "EXCLUSION" in check_data[course]:
                if check_data[course]["EXCLUSION"]["pass"] == True:
                    check_data[course]["pass"] = False
                    continue
            
            if "PRE-REQUISITE" in check_data[course] and "CO-REQUISITE" in check_data[course]:
                if is_failattr == True:
                    if check_data[course]["PRE-REQUISITE"]["pass"] == True or check_data[course]["CO-REQUISITE"]["pass"] == True:
                        check_data[course]["pass"] = True
                        check_data[course] = course_alter_prev_checking(course, check_data[course] , request_data)
                        continue
                    else:
                        check_data[course]["pass"] = False
                        continue
                else:        
                    if check_data[course]["PRE-REQUISITE"]["pass"] == True and check_data[course]["CO-REQUISITE"]["pass"] == True:
                        check_data[course]["pass"] = True
                        check_data[course] = course_alter_prev_checking(course, check_data[course] , request_data)
                        continue
                    else:
                        check_data[course]["pass"] = False
                        continue
            
            if "PRE-REQUISITE" in check_data[course]:
                if check_data[course]["PRE-REQUISITE"]["pass"] == True:
                    check_data[course]["pass"] = True
                    check_data[course] = course_alter_prev_checking(course, check_data[course] , request_data)
                    continue
                else:
                    check_data[course]["pass"] = False
                    continue
                
            if "CO-REQUISITE" in check_data[course]:
                if check_data[course]["CO-REQUISITE"]["pass"] == True:
                    check_data[course]["pass"] = True
                    check_data[course] = course_alter_prev_checking(course, check_data[course] , request_data)
                    continue
                else:
                    check_data[course]["pass"] = False
                    continue
                
            check_data[course]["pass"] = True
            check_data[course] = course_alter_prev_checking(course, check_data[course] , request_data)
            continue
        
        except:
            check_data[course]["respattr"] = {"error": "generic error"}
            check_data[course]["pass"] = True
            continue
        
    
    return check_data

def course_action_checking(items, userdb, current_attr, data, is_failattr, request_data):
    
    if items["action"] == "and":
        # Recursion
        for item in items["array"]:
            course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
        
        # Check for whether the action is satisfied    
        isPass = True
        for item in items["array"]:
            if item["pass"] == False:
                isPass = False
        items["pass"] = isPass
        return items
    
    elif items["action"] == "or":
        # Recursion
        for item in items["array"]:
            course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
            
        # Check for whether the action is satisfied        
        isPass = False
        for item in items["array"]:
            if item["pass"] == True:
                isPass = True
        items["pass"] = isPass
        return items
    
    elif items["action"] == "pass_qualifcation": 
        # Recursion
        for item in items["array"]:
            course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
        # Check for whether the action is satisfied        
        items["pass"] = items["array"][0]["pass"]
        return items
        
    elif items["action"] == "not":
        # Recursion
        for item in items["array"]:
            course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
        # Check for whether the action is satisfied    
        items["pass"] = not items["array"][0]["pass"]
        return items
    
    elif items["action"] == "pass_course":
        return course_pass_course_checking(items, userdb, current_attr)
    elif items["action"] == "pass_certain_level":    
        return course_pass_certain_level_checking(items, userdb)
    elif items["action"] == "grade_course":   
        return course_grade_course_checking(items, userdb)
    elif items["action"] == "is_major":
        return course_is_major_checking(items, userdb, request_data)
    elif items["action"] == "is_school":
        return course_is_school_checking(items, userdb, request_data)
    elif items["action"] == "fail_attr":
        return course_fail_attr_checking(items, userdb, data, is_failattr, request_data)
    elif items["action"] == "CGA":        
        return course_CGA_checking(items, userdb)
    elif items["action"] == "level_DSE":
        return course_level_DSE_checking(items, userdb)
    elif items["action"] == "approval":
        return course_approval_checking(items, userdb)           
    
def course_pass_course_checking(item, userdb, current_attr):
    pass_grade_list = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "P", "T", "CR", "DI", "DN", "PA", "PS"]
    # check for wether the "courses" key exist
    if "courses" not in userdb:
        item["pass"] = False
        return item
    check_courses_list = []
    if (item["course"][:4]+item["course"][5:]) not in globalVariable.courseids:
        for coursei in globalVariable.courseids:
            course = copy.deepcopy(coursei)
            if course.find(item["course"][:4]+item["course"][5:]) != -1:
                check_courses_list.append(course[:4] + " " + course[4:])
    else:        
        check_courses_list.append(item["course"]) 
    
    for courses in check_courses_list:
        if courses in userdb["courses"]:
            # for all semester enrolled
            for semester in userdb["courses"][courses]:
                if userdb["courses"][courses][semester]["grade"] in pass_grade_list:
                    item["pass"] = True
                    return item
                if current_attr == "CO-REQUISITE" or current_attr == "EXCLUSION":
                    if userdb["courses"][courses][semester]["grade"] == "----":
                        item["pass"] = True
                        return item
            item["pass"] = False
            return item
    
    item["pass"] = False
    return item        

def course_pass_certain_level_checking(item, userdb):
    pass_grade_list = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "P", "T", "CR", "DI", "DN", "PA", "PS"]
    # check for wether the "courses" key exist
    if "courses" not in userdb:
        item["pass"] = False
        return item

    used_course_array = []
    for coursesi in globalVariable.courseids:
        courses = copy.deepcopy(coursesi)
        if courses[:4] == item["dept"] and courses[4:8] >= item["level"]:
            if courses[:4] + " " + courses[4:8] in userdb["courses"]:
                for semester in userdb["courses"][courses[:4] + " " + courses[4:8]]:
                    if userdb["courses"][courses[:4] + " " + courses[4:8]][semester]["grade"] in pass_grade_list:
                        used_course_array.append(courses)
    if len(used_course_array) >= 1:
        item["pass"] = True
        item["respattr"] = {}
        item["respattr"]["usedcourse"] = used_course_array
        return item
    else:
        item["pass"] = False
        return item
    
def course_grade_course_checking(item, userdb):
    pass_grade_list = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "P", "T", "CR", "DI", "DN", "PA", "PS"]
    # check for wether the "courses" key exist
    if "courses" not in userdb:
        item["pass"] = False
        return item
    
    if item["course"] in userdb["courses"]:
        # for all semester enrolled
        for semester in userdb["courses"][item["course"]]:
            if userdb["courses"][item["course"]][semester]["grade"] not in pass_grade_list:
                continue
            if pass_grade_list.index(userdb["courses"][item["course"]][semester]["grade"]) <= pass_grade_list.index(item["grade"]):
                item["pass"] = True
                return item
        item["pass"] = False
        return item
    else: 
        item["pass"] = False
        return item
    
def course_is_major_checking(item, userdb, request_data):
    major = copy.deepcopy(globalVariable.major_school_mapping[request_data["prog"][0]]["prog"])
    if major == item["major"]:
        item["pass"] = True
        return item
    item["pass"] = False
    return item

def course_is_school_checking(item, userdb, request_data):
    school = copy.deepcopy(globalVariable.major_school_mapping[request_data["prog"]]["school"])
    if school == item["school"]:
        item["pass"] = True
        return item
    item["pass"] = False
    return item
    
def course_fail_attr_checking(item, userdb, data, is_failattr, request_data):
    if "pass" not in item["target_attr"]:
        data[item["target_attr"]] = course_action_checking(data[item["target_attr"]], userdb, item["target_attr"], data, is_failattr, request_data)
        
    if data[item["target_attr"]]["pass"] == True:
        is_failattr = True
        item["pass"] = True  
    else:
        is_failattr = True
        item["pass"] = False
    return item

def course_CGA_checking(item, userdb):
    # check for wether the "courses" key exist
    if "courses" not in userdb:
        item["pass"] = False
        return item
    grade_list = {"A+": 43, "A": 40, "A-": 37, "B+": 33, "B": 30, "B-": 27, "C+": 23, "C": 20, "C-": 17, "D": 10}
    total_credits = 0
    total_grade_point = 0
    for courses in userdb["courses"]:
        for semester in userdb["courses"][courses]:
            if userdb["courses"][courses][semester]["grade"] in grade_list:
                total_grade_point += grade_list[userdb["courses"][courses][semester]["grade"]] * int(userdb["courses"][courses][semester]["units"])
                total_credits += int(userdb["courses"][courses][semester]["units"])
    calc_CGA = total_grade_point/(total_credits * 10)
    if calc_CGA >= float(item["CGA"]):
        item["pass"] = True
    else:
        item["pass"] = False
    return item
    
def course_level_DSE_checking(item, userdb):  
    # check for wether the "pastQuali" key exist
    if "pastQuali" not in userdb["profile"]:
        item["pass"] = False
        return item
    if "HKDSE" not in userdb["profile"]["pastQuali"]:
        item["pass"] = False
        return item
        
    HKDSE_level_list = {"U":0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "5*": 6, "5**": 7}
    
    if item["subject"] in userdb["profile"]["pastQuali"]["HKDSE"]:
        if "attr" in item: # If exact == True
            if "level" in item: # No need to check for subpaper
                if item["subject"] == "Chinese Language" or item["subject"] == "English Language":
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Overall"]] == item["level"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                else:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]] == item["level"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
            else: # Need to check for subpaper (Must be English)
                if "Overall" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Overall" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Overall"]] == item["Overall"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Reading" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Reading" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Reading"]] == item["Reading"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Writing" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Writing" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Writing"]] == item["Writing"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Speaking" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Speaking" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Speaking"]] == item["Speaking"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Listening" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]  and "Listening" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Listening"]] == item["Listening"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                else: 
                    item["pass"] = False
                    return item
        else:
            if "level" in item: # No need to check for subpaper
                if item["subject"] == "Chinese Language" or item["subject"] == "English Language":
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Overall"]] >= item["level"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                else:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]] >= item["level"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
            else: # Need to check for subpaper (Must be English)
                if "Overall" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Overall" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Overall"]] >= item["Overall"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
    
                if "Reading" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Reading" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Reading"]] >= item["Reading"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Writing" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Writing" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Writing"]] >= item["Writing"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Speaking" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Speaking" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Speaking"]] >= item["Speaking"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                
                if "Listening" in userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]] and "Listening" in item:
                    if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"][item["subject"]]["Listening"]] >= item["Listening"]:
                        item["pass"] = True
                        return item
                    else:
                        item["pass"] = False
                        return item
                else: 
                    item["pass"] = False
                    return item
                    
    elif item["subject"].find("Combined Science") != -1:
        if item["subject"].find("Chemistry") != -1:
            if "Combined Science (Chemistry + Biology)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Chemistry + Biology)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            elif "Combined Science (Physics + Chemistry)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Physics + Chemistry)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            else:
                item["pass"] = False
                return item
            
        if item["subject"].find("Biology") != -1:
            if "Combined Science (Chemistry + Biology)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Chemistry + Biology)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            elif "Combined Science (Physics + Biology)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Physics + Biology)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            else:
                item["pass"] = False
                return item
            
        if item["subject"].find("Physics") != -1:
            if "Combined Science (Physics + Biology)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Physics + Biology)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            elif "Combined Science (Physics + Chemistry)" in userdb["profile"]["pastQuali"]["HKDSE"]:
                if HKDSE_level_list[userdb["profile"]["pastQuali"]["HKDSE"]["Combined Science (Physics + Chemistry)"]] >= item["level"]:
                        item["pass"] = True
                        return item
            else:
                item["pass"] = False
                return item
    else:
        item["pass"] = False
        return item
    
def course_approval_checking(item, userdb):
    if "profile" not in userdb:
        item["pass"] = False
        return item
    
    if "specialApprovals" not in userdb["profile"]:
        item["pass"] = False
        return item

    if "selfDeclear" not in userdb["profile"]["specialApprovals"]:
        item["pass"] = False
        return item
    
    if item["note"] in userdb["profile"]["specialApprovals"]["selfDeclear"]:
        item["pass"] = True
        return item
        
    item["pass"] = False
    return item

def course_alter_prev_checking(course, items, request_data):
    array = []
    if "ALTERNATE CODE(S)" in globalVariable.courseids[course]:
        for item in globalVariable.courseids[course]["ALTERNATE CODE(S)"].split(","):
            array.append(item.strip().replace(" ", ""))
            
    if "PREVIOUS CODE" in globalVariable.courseids[course]:
        for item in globalVariable.courseids[course]["PREVIOUS CODE"].split(","):
            array.append(item.strip().replace(" ", ""))
            
    brray = []
    for a in request_data["userdb"]["courses"].keys():
        brray.append(a.replace(" ", ""))
            
    for item in array:
        if item in brray:
            items["pass"] = False   
            items["respattr"] = {"PrevAltrCrash": True}
    
    return items
            

##############################
# Major checking
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
        if globalVariable.major[year][i]["attr"]["type"] != "option":
            global user
            user = copy.deepcopy(userdb)
        recursion = switch(globalVariable.major[year][i]["action"], globalVariable.major[year][i])
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