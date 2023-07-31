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
                if request_data["userdb"]["profile"]["currentStudies"]["studyProgram"] == "UG" and int(course[4:8]) >= 5000:
                    check_data[course]["pass"] = False
                if request_data["userdb"]["profile"]["currentStudies"]["studyProgram"] == "PG" and int(course[4:8]) < 5000:
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


##############################
# course checking
##############################
    
def course_action_checking(items, userdb, current_attr, data, is_failattr, request_data):
    
    match items["action"]:
        case "and":
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
        
        case "or":
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
    
        case "pass_qualifcation":
            # Recursion
            for item in items["array"]:
                course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
            # Check for whether the action is satisfied        
            items["pass"] = items["array"][0]["pass"]
            return items
        
        case "not":
            # Recursion
            for item in items["array"]:
                course_action_checking(item, userdb, current_attr, data, is_failattr, request_data)
            # Check for whether the action is satisfied    
            items["pass"] = not items["array"][0]["pass"]
            return items
    
        case "pass_course":
            return course_pass_course_checking(items, userdb, current_attr)
        case "pass_certain_level":    
            return course_pass_certain_level_checking(items, userdb)
        case "grade_course":   
            return course_grade_course_checking(items, userdb)
        case "is_major":
            return course_is_major_checking(items, userdb, request_data)
        case "is_school":
            return course_is_school_checking(items, userdb, request_data)
        case "fail_attr":
            return course_fail_attr_checking(items, userdb, data, is_failattr, request_data)
        case "CGA":        
            return course_CGA_checking(items, userdb)
        case "level_DSE":
            return course_level_DSE_checking(items, userdb)
        case "approval":
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