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
        PCG[course].update([["PRE-REQUISITE-BY", Form_Course_by(course, course_list, "pre")]])
        PCG[course].update([["CO-REQUISITE-BY", Form_Course_by(course, course_list, "co")]])
        PCG[course].update([["EXCLUSION-BY", Form_Course_by(course, course_list, "exclu")]])
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
  
def Form_Course(course, course_id, mode):
    dict = {}
    list = []
    if course_id not in globalVariable.phrased_course or course not in globalVariable.phrased_course[course_id]:
        if mode == "pre":
            dict.update([["PRE-REQUISITE", list]])
        elif mode == "co":
            dict.update([["CO-REQUISITE", list]])
        else:
            dict.update([["EXCLUSION", list]])
        return dict
    else:
        if mode == "pre":
            if "PRE-REQUISITE" in globalVariable.phrased_course[course_id][course]:
                Recur_function(globalVariable.phrased_course[course_id][course]["PRE-REQUISITE"], list)
            dict.update([["PRE-REQUISITE", list]])
            return dict
        elif mode == "co":
            if "CO-REQUISITE" in globalVariable.phrased_course[course_id][course]:
                Recur_function(globalVariable.phrased_course[course_id][course]["CO-REQUISITE"], list)
            dict.update([["CO-REQUISITE", list]])
            return dict
        else:
            if "EXCLUSION" in globalVariable.phrased_course[course_id][course]:
                Recur_function(globalVariable.phrased_course[course_id][course]["EXCLUSION"], list) 
            dict.update([["EXCLUSION", list]])
            return dict

def FormResult(course_list):
    for course in globalVariable.insems:
        if course in course_list:
            id = globalVariable.insems[course][len(globalVariable.insems[course])-1]
            result.update([[course, [Form_Course(course, id, "pre"), Form_Course(course, id, "co"), Form_Course(course, id, "exclu")]]])

def Form_Course_by(course, course_list, mode):
    list = []
    if mode == "pre":
        key = "PRE-REQUISITE"
        num = 0
    elif mode == "co":
        key = "CO-REQUISITE"
        num = 1
    else:
        key = "EXCLUSION"
        num = 2
    for prereq_course in course_list:
        for i in result[prereq_course][num][key]:
            if i == course:
                list.append(prereq_course)
        list.sort()
    return list
    
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
