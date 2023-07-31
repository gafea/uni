import json
import checking_function
import copy


with open("test.json", "r", encoding="utf-8") as f:
    requirement = json.load(f)
with open("user.json", "r", encoding="utf-8") as f:
    profile = json.load(f)
with open("courseids.json", "r", encoding="utf-8") as f:
    ids = json.load(f)
with open("result.json", "r", encoding="utf-8") as f:
    result = json.load(f)    

Result = {}
PCG = {}

def Recur_function(items, array):
    if items["action"] == "pass_course":
        if (items["course"][:4] + items["course"][5:]) not in ids:
            for coursei in ids:
                course = copy.deepcopy(coursei)
                if course.find(items["course"][:4] + items["course"][5:]) != -1:
                    array.append(course)
        else:
            array.append(items["course"][:4] + items["course"][5:])
    elif items["action"] == "or" or items["action"] == "and":
        for item in items["array"]:
            Recur_function(item, array)
    
#e.g.["prereq1", "prereq2", "coreq"] 
def FormPrereq_Coreq(course, course_id, flag):
    prereq = []
    coreq = []
    if "PRE-REQUISITE" not in requirement[course_id][course]:
        pass
    else:
        Recur_function(requirement[course_id][course]["PRE-REQUISITE"], prereq)
        prereq.insert(0, "Start of PRE-REQUISITE")
    if "CO-REQUISITE" in requirement[course_id][course]:
        coreq.append("Start of CO-REQUISITE")
        Recur_function(requirement[course_id][course]["CO-REQUISITE"], coreq)
    prereq.extend(coreq)
    return prereq
      
#e.g.{"action": "pass_course", "course": targeted course}
def FormCourse(course, course_id):
    current = {}
    current.update([["action", "pass_course"]])
    current.update([["course", course]])
    current.update([["insem", course_id]])
    return current

#e.g.{"EXCLUSION": ["exclu1", "exclu2"]}
def FormExclu(course, course_id):
    exclu = {}
    exclu_list = []
    if "EXCLUSION" not in requirement[course_id][course]:
        pass
    else:   
        Recur_function(requirement[course_id][course]["EXCLUSION"], exclu_list)
    exclu.update([["EXCLUSION", exclu_list]])
    return exclu

def FormResult():
    for id in requirement:
        if int(id) < 1830:
            continue
        for course in requirement[id]: 
            Result.update([[course, [FormPrereq_Coreq(course, id, ""), FormCourse(course, id), FormExclu(course, id)]]])
    return Result

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
    for id in requirement:
        if int(id) < 1830:
            continue
        course_list = descending()
        for course in requirement[id]:   
            PCG.update([[course, {}]])
            PCG[course].update([["PRE-REQUISITE-BY", FormPrereq_by(course, course_list)]])
            PCG[course].update([["CO-REQUISITE-BY", FormCoreq_by(course, course_list)]])
            PCG[course].update([["EXCLUSION-BY", FormExclu_by(course, course_list)]])
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

def descending():
    i = []
    for id in requirement:
        if int(id) < 1830:
            continue
        for course in requirement[id]:
            i.append(course)
    return sort_descend(i)

def outputResult():
    output = FormResult()
    with open("result.json", "w") as f:
        json.dump(output, f, indent = 4)

def outputPCG():
    output = FormPCG()
    with open("PCG.json", "w") as f:
        json.dump(output, f, indent = 4)

# Main part

l = {
    "ACCT2200": [
        [
            "Start of PRE-REQUISITE",
            "ACCT2010"
        ],
        {
            "action": "pass_course",
            "course": "ACCT2200",
            "insem": "2230"
        },
        {
            "EXCLUSION": ["ACCT2010", "ACCT2010", "ACCT2010"]
        }
    ]
}

outputResult()
outputPCG()

