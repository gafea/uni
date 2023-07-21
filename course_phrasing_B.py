##############################
# version number
##############################
version = 1

##############################
# globalVarible with webserver
##############################
import globalVarible
import json
import re

##############################
# import masking
##############################
with open('masking.json', encoding = "utf-8") as f:
    replacement = json.load(f)
    
##############################
# Golbal Variable
##############################
targetAttr = ["PRE-REQUISITE", "EXCLUSION", "CO-REQUISITE"]
# v need to code v
dept_list = ["ACCT", "AESF", "AIAA", "AMAT", "BIBU", "BIEN", "BSBE", "BTEC", "CBME", "CENG", "CHEM", "CHMS", "CIEM", "CIVL", "CMAA", "COMP", "CORE", "CPEG", "CSIC", "CSIT", "DASC", "DBAP", "DSAA", "DSCT", "ECON", "EEMT", "EESM", "ELEC", "EMBA", "EMIA", "ENEG", "ENGG", "ENTR", "ENVR", "ENVS", "EOAS", "EVNG", "EVSM", "FINA", "FTEC", "FUNH", "GBUS", "GFIN", "GNED", "HART", "HHMS", "HLTH", "HMMA", "HUMA", "IBTM", "IDPO", "IEDA", "IIMP", "IMBA", "INFH", "INTR", "IOTA", "IPEN", "ISDN", "ISOM", "JEVE", "LABU", "LANG", "LIFS", "MAED", "MAFS", "MARK", "MASS", "MATH", "MECH", "MESF", "MFIT", "MGCS", "MGMT", "MICS", "MILE", "MIMT", "MSBD", "MSDM", "MTLE", "NANO", "OCES", "PDEV", "PHYS", "PPOL", "RMBI", "ROAS", "SBMT", "SCIE", "SEEN", "SHSS", "SMMG", "SOSC", "SUST", "SYSH", "TEMG", "UGOD", "UROP", "WBBA"]

dept_modify_OR = []
dept_modify_AND = []
# Find department that contain keywords
for dept in dept_list:
    if(dept.find("OR") != -1):
        dept_modify_OR.append(dept)
    if(dept.find("AND") != -1):
        dept_modify_AND.append(dept)
# For phrasing
HKDSE_list = {"Chinese": "Chinese Language", "English": "English Language", "Biology": "Biology", "Chemistry": "Chemistry", "Physics": "Physics", "M1": "Mathematics Extended Part (M1: Calculus and Statistics)", "M2": "Mathematics Extended Part (M2: Algebra and Calculus)", "Economics": "Economics"}
HKDSE_level_list = {"U":0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "5*": 6, "5**": 7}
grade_list = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"]
attr_list = ["corequisites", "prerequisites"]
school_list = ["Science", "Engineering"]

##############################
# Copying
##############################
def copy(courseids,courses):
    copyed_data = {}
    
    for courseCode in courseids:
    # Ignore 5000+ level
    # Bye Bye PG
        if int(courseCode[4:8]) >= 5000:
            continue
    
        department = str(courseCode)[:4]
        semester = courseids[courseCode]["SEM"]
        course_title = courseids[courseCode]["COURSEID"]
        for attr in targetAttr:
            if attr in courses[department][semester][course_title]["attr"]:
                if not semester in copyed_data:
                    copyed_data[semester] = {}
                if not courseCode in copyed_data[semester]:
                    copyed_data[semester][courseCode] = {}
                if not "attr" in copyed_data[semester][courseCode]:
                    copyed_data[semester][courseCode]["attr"] = {}
                    
                copyed_data[semester][courseCode]["attr"]["type"] = "course"
                copyed_data[semester][courseCode][attr] = courses[department][semester][course_title]["attr"][attr]
    return copyed_data

##############################
# cleaning
##############################
def removeKeywordsFromDept(content):
    for dept in dept_modify_OR:
        dept_pos = content.find(dept)
        if dept_pos != -1:
            new_dept = dept.replace("OR", "or")
            content = content.replace(dept,new_dept)

    for dept in dept_modify_AND:
        dept_pos = content.find(dept)
        if dept_pos != -1:
            new_dept = dept.replace("AND", "and")
            content = content.replace(dept,new_dept)
    return  content

def clean(copyed_data):
    for semester in copyed_data:
        for course in copyed_data[semester]:
            if "EXCLUSION" in copyed_data[semester][course]:
                exclusions = copyed_data[semester][course]["EXCLUSION"]
                
                # Remove ;
                while True:
                    semiColon_pos = exclusions.find(";")
                    if semiColon_pos == -1:
                        break
                    exclusions = exclusions[:semiColon_pos] + " OR" + exclusions[semiColon_pos+1:]

                # Remove ,
                while True:
                    comma_pos = exclusions.find(",")
                    if comma_pos == -1:
                        break
                    deptFound = False
                    for department in dept_list:
                        # Dealing with special case "Any 2000-level or above courses in CHEM, LIFS, CENG, BIEN"
                        if exclusions[comma_pos-4:comma_pos] == department:
                            exclusions = exclusions[:comma_pos] + "/" + exclusions[comma_pos+2:]
                            deptFound = True
                            break
                            
                    if(not deptFound):
                        exclusions = exclusions[:comma_pos] + " OR" + exclusions[comma_pos+1:]
                exclusions = exclusions.replace("HKDSE 1/2x OR", "HKDSE 1/2x or")
                exclusions = exclusions.replace("\n", " ")

                # Remove keywords(AND / OR)
                exclusions = removeKeywordsFromDept(exclusions)
                
                copyed_data[semester][course]["EXCLUSION"] = exclusions
                    
            
            if "CO-REQUISITE" in copyed_data[semester][course]:
                co_requisites = copyed_data[semester][course]["CO-REQUISITE"]
                
                # Remove keywords(AND / OR)
                co_requisites = removeKeywordsFromDept(co_requisites)
                
                while True:
                    comma_pos = co_requisites.find(",")
                    if comma_pos == -1:
                        break
                    co_requisites = co_requisites[:comma_pos] + " AND" + co_requisites[comma_pos+1:]

                co_requisites = co_requisites.replace("\n", " ")

                # If there is logic error in phrasing, please consider this line
                co_requisites = co_requisites.replace("for", "For")
                co_requisites = co_requisites.replace("HKDSE 1/2x OR", "HKDSE 1/2x or")
                copyed_data[semester][course]["CO-REQUISITE"] = co_requisites

            if "PRE-REQUISITE" in copyed_data[semester][course]:
                pre_requisites = copyed_data[semester][course]["PRE-REQUISITE"]

                # replace " / " to "OR "
                while True:
                    slashWithSpace_pos = pre_requisites.find(" / ")
                    if slashWithSpace_pos == -1:
                        break
                    pre_requisites = pre_requisites[:slashWithSpace_pos] + "OR " + pre_requisites[slashWithSpace_pos+3:]
                
                # replace " or dept" to " OR dept"
                while True:
                    or_pos = pre_requisites.find(" or ")
                    if or_pos == -1:
                        break
                    deptFound = False
                    for department in dept_list:
                        if pre_requisites[or_pos+4:or_pos+8] == department:
                            pre_requisites = pre_requisites[:or_pos] + " OR " + pre_requisites[or_pos+3:]
                            deptFound = True
                            break    
                    if(not deptFound):
                        break
                
                # Replace " and " to " AND"
                while True:
                    and_pos = pre_requisites.find(" and ")
                    if and_pos == -1:
                        break
                    deptFound = False
                    for department in dept_list:
                        if pre_requisites[and_pos+4:and_pos+10].find(department) != -1 and pre_requisites[and_pos-4:and_pos].isdigit() == True:
                            pre_requisites = pre_requisites[:and_pos] + " AND" + pre_requisites[and_pos+4:]
                            deptFound = True
                            break    
                    if(not deptFound):
                        break
                
                # Replace " and " to " AND"
                while True:
                    and_pos = pre_requisites.find("/")
                    if and_pos == -1:
                        break
                    deptFound = False
                    for department in dept_list:
                        if pre_requisites[and_pos+1:and_pos+5].find(department) != -1 and pre_requisites[and_pos-4:and_pos].isdigit() == True:
                            pre_requisites = pre_requisites[:and_pos] + " OR " + pre_requisites[and_pos+1:]
                            deptFound = True
                            break    
                    if(not deptFound):
                        break
                pre_requisites = pre_requisites.replace("\n", " ")
                pre_requisites = pre_requisites.replace("; or", " OR")
                pre_requisites = pre_requisites.replace("; OR", " OR")
                pre_requisites = pre_requisites.replace("OR Equivalent", "")
                pre_requisites = pre_requisites.replace("OR equivalent", "")
                pre_requisites = pre_requisites.replace(", and", " AND") 
                pre_requisites = pre_requisites.replace(", AND", " AND")
                pre_requisites = pre_requisites.replace("HKDSE 1/2x OR", "HKDSE 1/2x or")
                pre_requisites = pre_requisites.replace("equivalence of the above", "")
                
                # Clear ambiguous comma
                
                comma_pos = pre_requisites.find(",")
                if comma_pos != -1:
                    if pre_requisites.find("One of") != -1:
                        pre_requisites = pre_requisites.replace(",", " OR")
                    if pre_requisites[comma_pos-1].isdigit() == True:
                        pre_requisites = pre_requisites.replace(",", " AND")
                    else:
                        pre_requisites = pre_requisites.replace(",", " and")
                
                # Remove keywords(AND / OR)
                pre_requisites = removeKeywordsFromDept(pre_requisites)
                
                # If there is logic error in phrasing, please consider this line
                pre_requisites = pre_requisites.replace("for", "For")
                
                copyed_data[semester][course]["PRE-REQUISITE"] = pre_requisites
    
    return copyed_data

##############################
# formating
##############################
def AND_OR_basePhrase (content):

    OR_pos = content.find("OR")
    AND_pos = content.find("AND")
    current_location = ""
        
    # AND and OR does not exist
    if AND_pos == -1 and OR_pos == -1:
        # Nothing happen
        return content
        
    # AND does not exisit
    if AND_pos == -1:
        current_location = {"action": "or"}
        array_list = []
        for element in content.split("OR"):
            array_list.append(element.strip())
        current_location["array"] = array_list
        return current_location

    # OR does not exisit
    if OR_pos == -1:
        current_location = {"action": "and"}
        array_list = []
        for element in content.split("AND"):
            array_list.append(element.strip())
        current_location["array"] = array_list
        return current_location

    # Both AND and OR exisit (assume AND always do first)
    current_location = {"action": "and"}
    and_array_list = []
    for element in content.split("AND"):
        and_array_list.append(element.strip())
    
    array = []
    for element in and_array_list:
        array.append(AND_OR_basePhrase(element))
    current_location["array"] = array
    return current_location

def AND_OR_Phrase_helper(local_output, content, content_phrased):
    for i in range(len(local_output["array"])):
        if "action" in local_output["array"][i]:
            AND_OR_Phrase_helper(local_output["array"][i], content, content_phrased)
        if local_output["array"][i] == content:
            local_output["array"][i] = content_phrased
    return local_output
               
def AND_OR_Phrase (content):
    local_output = ""
    curly_brackets_content = ""
    curly_brackets_open_pos = content.find("{")
    
    square_brackets_content = ""
    square_brackets_open_pos = content.find("[")
    
    if curly_brackets_open_pos != -1:
        curly_brackets_close_pos = content.find("}")
        curly_brackets_content = content[curly_brackets_open_pos + 1:curly_brackets_close_pos]
        curly_brackets_content_phrased = AND_OR_Phrase (curly_brackets_content)
        content = content.replace("{" + curly_brackets_content + "}", "CurlyBracketsContent")
        local_output = AND_OR_basePhrase(content)
        
        local_output = AND_OR_Phrase_helper(local_output, "CurlyBracketsContent", curly_brackets_content_phrased)
        return local_output

    if square_brackets_open_pos != -1:
        square_brackets_close_pos = content.find("]")
        square_brackets_content = content[square_brackets_open_pos + 1:square_brackets_close_pos]
        square_brackets_content_phrased = AND_OR_basePhrase(square_brackets_content)
        content = content.replace("[" + square_brackets_content + "]", "SquareBracketsContent")
        local_output = AND_OR_basePhrase(content)
        
        local_output = AND_OR_Phrase_helper(local_output, "SquareBracketsContent", square_brackets_content_phrased)
        return local_output
    
    return AND_OR_basePhrase(content)
    
def separate_for (content):
    
    For_pos = content.find("For")
    # No For requirement
    if For_pos == -1:
        return AND_OR_Phrase(content) # Nothing happen
    
    semiColon_pos = content.find(";")
    
    # There is only one For requirement
    if semiColon_pos == -1:
        current_location = {"action" : "and"}
        array = []
    
        # Separate For requirement and courses
        closeBracket_pos = content[For_pos:].find(")")
        array.append(content[:closeBracket_pos + 1].strip())
        array.append(content[closeBracket_pos + 1:].strip())

        # The format of For requirement need to be the same with the courses
        OR_pos = content[closeBracket_pos + 1:].find("OR")
        AND_pos = content[closeBracket_pos + 1:].find("AND")
        # The format of For requirement need to be changed
        if OR_pos != -1 or AND_pos != -1:
            current_location["array"] = [{"action" : "temp", "For_requirement" : content[:closeBracket_pos + 1]},AND_OR_basePhrase(content[closeBracket_pos + 1:])]
            return current_location
        
         # The format of For requirement NO need to be changed
        new_array = []
        for element in array:
            new_array.append(AND_OR_Phrase(element))
        current_location["array"] = new_array
        return current_location
    
    # There is multiple For requirements
    current_location = {"action" : "or"}
    colon_array_list = []
    for element in content.split(";"):
        colon_array_list.append(element.strip())
    
    array = []
    for element in colon_array_list:
        array.append(separate_for(element))
    current_location["array"] = array
    return current_location

def formating(cleaned_data):
    for semester in cleaned_data:
        for course in cleaned_data[semester]:
            for attr in targetAttr:
                if attr in cleaned_data[semester][course]:
                    contents = cleaned_data[semester][course][attr]
                    
                    cleaned_data[semester][course][attr] = {}
                    cleaned_data[semester][course][attr] = separate_for(contents)
                    continue
    return cleaned_data

##############################
# phrasing
##############################   
def phrase_approval (content):
    if content.find("DDP") != -1:
        return phrase_isMajor(content)

    return {"action": "approval", "note": content}

def phrase_passCourse(content):
    # Remove / that previous cannot clean
    if content.find("/") != -1:
        current_location = {"action": "or"}
        array = []
        for dept in dept_list:
            if content.find(dept) != -1:
                for course in content.split("/"):
                    if course.find(dept) != -1:
                        array.append(dept + " " + course)
                    else:
                        array.append(course)
                    current_location["array"] = array
                    
                    for coursecode in current_location["array"]:
                        coursecode = phrase_passCourse(coursecode)
        return current_location
    courseCode = ""
    
    for i, char in enumerate(content):
        if char.isdigit():
            first_digit_index = i
            break
    
    for dept in dept_list:
        if content.find(dept) != -1:
            courseCode = dept + " " + content[first_digit_index:first_digit_index+5].strip()
    return {"action": "pass_course", "course": courseCode}
    
def phrase_passCertainLevel(content):
    output_dept = ""
    output_level = 0
    consecutive_numbers = re.findall(r'\d+', content)
    if len(consecutive_numbers) != 1:
        phrase_approval(content)
    output_level = consecutive_numbers[0]
    for dept in dept_list:
        if content.find(dept) != -1:
            output_dept = dept
    return {"action": "pass_certain_level", "dept": output_dept, "level": output_level}

def phrase_gradeCourse(content):
    output_course = ""
    output_grade = ""
    
    # Find grade
    grade_pos = content.find("grade")
    if grade_pos == -1:
        grade_pos = content.find("Grade")

    for grade in grade_list:
        if content[grade_pos + 6:grade_pos + 8].strip() == grade:
            output_grade = grade
            break
            
    for i, char in enumerate(content):
        if char.isdigit():
            first_digit_index = i
            break
    
    for dept in dept_list:
        if content.find(dept) != -1:
            output_course = dept + " " + content[first_digit_index:first_digit_index+5].strip()
    return {"action": "grade_course", "course": output_course, "grade": output_grade}

def phrase_isMajor(content):
    if content.find("DDP") != -1:
        return {"action": "is_major" , "major": "DDP"}
    
    if content.find("IRE") != -1:  
        # Same as without IRE, just add the word IRE to the ouput
        array_dept = []
        for dept in dept_list:
            if content.find(dept) != -1:
                array_dept.append(dept)
        if len(array_dept) > 1:
            current_location = {"action": "or" , "array": array_dept}
            new_array = []
            for dept in array_dept:
                new_array.append({"action": "is_major" , "major": "IRE_" + dept}) 
                current_location["array"] = new_array
            return current_location
        array_dept[0] = "IRE_" + array_dept[0]
        return {"action": "is_major" , "major": array_dept[0]}
    
    array_dept = []
    for dept in dept_list:
        if content.find(dept) != -1:
            array_dept.append(dept)
    if len(array_dept) > 1:
        current_location = {"action": "or" , "array": array_dept}
        for dept in array_dept:
            dept = {"action": "is_major" , "major": dept}
        return current_location
    return {"action": "is_major" , "major": array_dept[0]}
    
def phrase_nonMajor(content):
    return {"action": "non", "note" : phrase_isMajor(content)}    

def phrase_isSchool(content):
    for school in school_list:
        if content.find(school) != -1:
            return {"action": "is_school", "school": school.lower()}

def phrase_failAttr(content):
    for attr in attr_list:
        if content.find(attr) != -1:
            return {"action": "fail_attr", "school": attr}

def phrase_CGA(content):
    dot_pos = content.find(".")
    CGA = content[dot_pos-1:dot_pos+3]
    return {"action": "CGA", "CGA": CGA} 

def phrase_HKDSE(content):
    current_list = {"action": "pass_qualifcation", "qualifcation": {}}
    array = []
    # Find level
    level_pos = content.find("level")
    level = 0
    if level_pos == -1:
        level_pos = content.find("Level")
    
    # if substring level doesnot exisit
    if level_pos == -1:
        level = 1
    else:
        level = HKDSE_level_list[content[level_pos+6:level_pos+8].strip()]
    
    # Find subject in content
    for subject in HKDSE_list:   
        if content.find(subject) != -1:
            array.append(subject)
    
    if len(array) > 1:
        current_list["qualifcation"] = {"action": "or"}

    for subject in array:
        if subject == "Biology" or subject == "Chemistry" or subject == "Physics":
            # Both exisit
            if content.find("1/2x") != -1 and content.find("1x") != -1:
                if "action" not in current_list["qualifcation"]:
                    current_list["qualifcation"] = {"action": "or"}
                array.append("Combine Science - " + subject)
            # Only Combine Science
            elif content.find("1/2x") != -1: 
                subject = "current_list - " + subject
            
            # NO Combine Science
            elif content.find("1x") != -1:
                if level == 1:
                    level = 3
    
    if "action" in current_list["qualifcation"]:
        new_array = []
        for subject in array:
            if subject.find("Combine Science") != -1:
                new_array.append({"action": "level_DSE", "subject": subject, "level": level})
            else:
                new_array.append({"action": "level_DSE", "subject": HKDSE_list[subject], "level": level}) 
        current_list["qualifcation"]["array"] = new_array
        return current_list
    current_list["qualifcation"] = {"action": "level_DSE", "subject": HKDSE_list[array[0]], "level": level}
    return current_list

def phrasetype (content):
    deptFound = False
    numberFound = False
    levelFound = False
    gradeFound = False
    nonFound = False
    CGAFound = False
    HKDSEFound = False
    schoolFound = False
    attrFound = False
    
    for dept in dept_list:
        if content.find(dept) != -1:
            deptFound = True 
    
    numberFound = any(char.isdigit() for char in content)
    
    if content.find("level") != -1 or content.find("Level") != -1:
        levelFound = True
        
    if content.find("grade") != -1 or content.find("Grade") != -1:
        gradeFound = True
        if content.find("passing") != -1:
            gradeFound = False
        
    if content.find("non") != -1:
        nonFound = True
        
    if content.find("CGA") != -1:
        CGAFound = True
        
    if content.find("HKDSE") != -1:
        HKDSEFound = True
        
    for school in school_list:
        if content.find(school) != -1:
            schoolFound = True
            
    for attr in attr_list:
        if content.find(attr) != -1:
            attrFound = True    

    # 
    if deptFound and numberFound and not levelFound and not gradeFound:
        return phrase_passCourse(content)
    
    if deptFound and numberFound and levelFound:
        return phrase_passCertainLevel(content)

    if deptFound and numberFound and gradeFound:
        return phrase_gradeCourse(content)
    
    if deptFound and not numberFound and not nonFound:
        return phrase_isMajor(content)
    
    
    if deptFound and not numberFound and nonFound:
        return phrase_nonMajor(content)
    
    if schoolFound:
        return phrase_isSchool(content)
    
    if attrFound:
        return phrase_failAttr(content)
    
    if CGAFound:
        return phrase_CGA(content)
    
    if not deptFound and HKDSEFound:
        return phrase_HKDSE(content)
    
    return phrase_approval(content)

def BaseCase(content):
    if "action" in content:
        array = []
        current_location = {"action" : content["action"]}
        #print(content)
        if content["action"] == "temp":
            content = content["For_requirement"]
        else:    
            for items in content["array"]:
                array.append(BaseCase(items))
                current_location["array"] = array
            return current_location

    content = content.replace("(","")
    content = content.replace(")","")
    content = content.replace("[","")
    content = content.replace("]","")
    content = content.replace("{","")
    content = content.replace("}","")
    content = content.replace("CorE","CORE") # Change when combine
    return phrasetype(content)

def phrase(formated_data):
    for semester in formated_data:       
        for course in formated_data[semester]:
            for attr in targetAttr:
                if attr in formated_data[semester][course]:
                    contents = formated_data[semester][course][attr]
                    formated_data[semester][course][attr] = BaseCase(contents)
    return formated_data

##############################
# Masking
############################## 
def masking(phrased_data):
    for course in replacement:
        phrased_data[globalVarible.insems[course][len(globalVarible.insems[course])-1]][course] = {}
        phrased_data[globalVarible.insems[course][len(globalVarible.insems[course])-1]][course] = replacement[course]
    return phrased_data


##############################
# main
##############################    
def main():
    copyed_data = copy(globalVarible.courseids,globalVarible.courses)
    cleaned_data = clean(copyed_data)
    formated_data = formating(cleaned_data)
    phrased_data = phrase(formated_data)
    return masking(phrased_data)
