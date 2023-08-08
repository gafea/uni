##############################
# version number
##############################
version = 1

import copy
import globalVariable
import checking_function_major

PCG = {}
result = {}


##############################
# main
##############################
# Main part
def main():
    return FormPCG()

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
  
def FormPrereq_Coreq(course, course_id):
    prereq = []
    coreq = []
    if course_id not in globalVariable.phrased_course or course not in globalVariable.phrased_course[course_id]:
        pass
    else:
        if "PRE-REQUISITE" not in globalVariable.phrased_course[course_id][course]:
            pass
        else:
            Recur_function(globalVariable.phrased_course[course_id][course]["PRE-REQUISITE"], prereq)
            prereq.insert(0, "Start of PRE-REQUISITE")
        if "CO-REQUISITE" in globalVariable.phrased_course[course_id][course]:
            coreq.append("Start of CO-REQUISITE")
            Recur_function(globalVariable.phrased_course[course_id][course]["CO-REQUISITE"], coreq)
    prereq.extend(coreq)
    return prereq

def FormCourse(course, course_id):
    current = {}
    current.update([["action", "pass_course"]])
    current.update([["course", course]])
    current.update([["insem", course_id]])
    return current

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
            result.update([[course, [FormPrereq_Coreq(course, id), FormCourse(course, id), FormExclu(course, id)]]])

def FormPrereq_by(course, course_list):
    course_prereq = []
    for pre_course in course_list:
        for i in result[pre_course][0]:
            if i == course:
                course_prereq.append(pre_course)
            elif i == "Start of CO-REQUISITE":
                break
    return course_prereq

def FormCoreq_by(course, course_list):
    course_coreq = []
    for pre_course in course_list:
        flag = 0
        for i in result[pre_course][0]:
            if i == course and flag == 1:
                course_coreq.append(pre_course)
            elif i == "Start of CO-REQUISITE":
                flag = 1
    return course_coreq

def FormExclu_by(course, course_list):
    course_exclu = []
    for pre_course in course_list:
        for i in result[pre_course][2]["EXCLUSION"]:
            if i == course:
                course_exclu.append(pre_course)
        course_exclu.sort()
    return course_exclu
    
def FormPCG():
    course_list = course_listing("descending")
    FormResult(course_list)
    for course in globalVariable.insems:   
        PCG.update([[course, {}]])
        PCG[course].update([["PRE-REQUISITE-BY", FormPrereq_by(course, course_list)]])
        PCG[course].update([["CO-REQUISITE-BY", FormCoreq_by(course, course_list)]])
        PCG[course].update([["EXCLUSION-BY", FormExclu_by(course, course_list)]])
    keys = ["PRE-REQUISITE-BY", "CO-REQUISITE-BY", "EXCLUSION-BY"]
    for i in PCG:
        for j in keys:
            PCG[i][j].sort()
    return PCG

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






