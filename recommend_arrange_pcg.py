##############################
# version number
##############################
version = 1

import copy
import globalVariable


PCG = {}
result = {}


##############################
# main
##############################
# Main part
def main():
    course_list = course_listing("descending")
    FormResult(course_list)
    course_list = course_listing("ascending")
    for course in globalVariable.insems:   
        PCG.update([[course, {}]])
        PCG[course].update([["PRE-REQUISITE-BY", FormPrereq_by(course, course_list)]])
        PCG[course].update([["CO-REQUISITE-BY", FormCoreq_by(course, course_list)]])
        PCG[course].update([["EXCLUSION-BY", FormExclu_by(course, course_list)]])
    return PCG

def Recur_function(items, array):
    if items["action"] == "pass_course":
        if (items["course"][:4] + items["course"][5:]) not in globalVariable.courseids:
            for coursei in globalVariable.courseids:
                course = copy.deepcopy(coursei)
                if course.find(items["course"][:4] + items["course"][5:]) != -1:
                    array.append(course)
        else:
            array.append(items["course"][:4] + items["course"][5:])
    elif items["action"] == "or" or items["action"] == "and":
        for item in items["array"]:
            Recur_function(item, array)
  
def FormPrereq_Coreq(course, course_id, mode):
    prereq = {}
    coreq = {}
    prereq_list = []
    coreq_list = []
    if course_id not in globalVariable.phrased_course or course not in globalVariable.phrased_course[course_id]:
        pass
    else:
        if "PRE-REQUISITE" not in globalVariable.phrased_course[course_id][course]:
            pass
        else:
            Recur_function(globalVariable.phrased_course[course_id][course]["PRE-REQUISITE"], prereq_list)
        if "CO-REQUISITE" in globalVariable.phrased_course[course_id][course]:
            Recur_function(globalVariable.phrased_course[course_id][course]["CO-REQUISITE"], coreq_list)
    prereq.update([["PRE-REQUISITE", prereq_list]])
    coreq.update([["CO-REQUISITE", coreq_list]])
    if mode == "co":
        return coreq
    return prereq

def FormExclu(course, course_id):
    exclu = {}
    exclu_list = []
    if course_id not in globalVariable.phrased_course or course not in globalVariable.phrased_course[course_id]:
        pass
    else:
        if "EXCLUSION" not in globalVariable.phrased_course[course_id][course]:
            pass
        else:   
            Recur_function(globalVariable.phrased_course[course_id][course]["EXCLUSION"], exclu_list)
    exclu.update([["EXCLUSION", exclu_list]])
    return exclu

def FormResult(course_list):
    for course in globalVariable.insems:
        if course in course_list:
            id = globalVariable.insems[course][len(globalVariable.insems[course])-1]
            result.update([[course, [FormPrereq_Coreq(course, id, ""), FormPrereq_Coreq(course, id, "co"), FormExclu(course, id)]]])

def FormPrereq_by(course, course_list):
    course_prereq = []
    for prereq_course in course_list:
        for i in result[prereq_course][0]["PRE-REQUISITE"]:
            if i == course:
                course_prereq.append(prereq_course)
        course_prereq.sort()
    return course_prereq

def FormCoreq_by(course, course_list):
    course_coreq = []
    for coreq_course in course_list:
        for i in result[coreq_course][1]["CO-REQUISITE"]:
            if i == course:
                course_coreq.append(coreq_course)
        course_coreq.sort()
    return course_coreq

def FormExclu_by(course, course_list):
    course_exclu = []
    for exclu_course in course_list:
        for i in result[exclu_course][2]["EXCLUSION"]:
            if i == course:
                course_exclu.append(exclu_course)
        course_exclu.sort()
    return course_exclu
    
def sort_descend(a):
    b = []
    for i in range(len(a)):
        for j in range(len(b)+1):
            if j == len(b):
                b.insert(j, a[i])
                break
            if  a[i][4:8] >= b[j][4:8]:
                b.insert(j, a[i])
                break
    return b

def sort_ascend(a):
    b = []
    for i in range(len(a)):
        for j in range(len(b)+1):
            if j == len(b):
                b.insert(j, a[i])
                break
            if  a[i][4:8] <= b[j][4:8]:
                b.insert(j, a[i])
                break
    return b

def course_listing(mode):
    i = []
    for course in globalVariable.insems:
        if int(globalVariable.insems[course][len(globalVariable.insems[course])-1]) >= 1910:
            if int(course[4:5]) <= 4:
                i.append(course)
    if mode == "descending":
        return sort_descend(i)
    elif mode == "ascending":
        return sort_ascend(i)
