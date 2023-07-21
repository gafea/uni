# user input(which major?), user json
# create json file output, number of credits

"""
1. Check string if have key
2. if in major databae, go to check major
3. return (true/false)
"""

import json
version = 1

# From major database
fm = open("major.json", 'r')
major = json.loads(fm.read())

# From user database
fu = open("user.json", 'r')
user = json.loads(fu.read())


def qualiMapping(exam, gradeQ, gradeU):
    match exam:
        case "HKDSE":
            level = ["5**", "5*", "5", "4", "3", "2", "1", "U"]

        case _:
            print("Error in Qualification Mapping")
            return False

    for i in level:
        if i == gradeU:
            return True
        if i == gradeQ:
            return False


def switch(action, code):
    match action:
        case "and":
            # Check if "not" exist
            blackList = []
            for i in code["array"]:
                if code["array"][i]["action"] == "not":
                    recursion = switch(code["array"][i]["action"], code["array"][i])
                    if not recursion[1]:
                        for j in range(len(recursion[2])):
                            blackList.append(recursion[2][j])
                    break

            check = True
            courseUsed = []
            creditUsed = 0
            courseNum = 0
            for i in code["array"]:
                recursion = switch(code["array"][i]["action"], code["array"][i])
                
                if not recursion[1]:
                    check = False

                if recursion[0] == "not":
                    continue

                courseUsed.append([i, recursion[2]])
                if recursion[2] is not None:
                    courseNum += len(recursion[2])
                creditUsed += int(recursion[3])
            
            min_credit = 0
            max_credit = 0
            min_course = 0
            max_course = 0
            if "attr" in code:
                if "min_credit" in code["attr"]:
                    min_credit = code["attr"]["min_credit"]
                if "credit" in code["attr"]:
                    min_credit, max_credit = code["attr"]["credit"]
                if "max_credit" in code["attr"]:
                    max_credit = code["attr"]["max_credit"]
                if "min_course" in code["attr"]:
                    min_course = code["attr"]["min_course"]
                if "course" in code["attr"]:
                    min_course, max_course = code["attr"]["course"]
                if "max_course" in code["attr"]:
                    max_course = code["attr"]["max_course"]
            if not min_credit:
                min_credit = 1
            if not max_credit:
                max_credit = min_credit * 100
            if not min_course:
                min_course = 1
            if not max_course:
                max_course = min_course * 10

            if creditUsed < min_credit or creditUsed > max_credit or courseNum < min_course or courseNum > max_course or not check:
                return ["and", False, courseUsed, creditUsed]
            return ["and", True, courseUsed, creditUsed]
                           

        case "or":
            check = False
            courseUsed = []
            creditUsed = 0
            courseNum = 0
            for i in code["array"]:
                recursion = switch(code["array"][i]["action"], code["array"][i])
                
                if recursion[1]:
                    check = True
                courseUsed.append([i, recursion[2]])
                if recursion[2] is not None:
                    courseNum += len(recursion[2])
                creditUsed += int(recursion[3])
            
            min_credit = 0
            max_credit = 0
            min_course = 0
            max_course = 0
            if "attr" in code:
                if "min_credit" in code["attr"]:
                    min_credit = code["attr"]["min_credit"]
                if "credit" in code["attr"]:
                    min_credit, max_credit = code["attr"]["credit"]
                if "max_credit" in code["attr"]:
                    max_credit = code["attr"]["max_credit"]
                if "min_course" in code["attr"]:
                    min_course = code["attr"]["min_course"]
                if "course" in code["attr"]:
                    min_course, max_course = code["attr"]["course"]
                if "max_course" in code["attr"]:
                    max_course = code["attr"]["max_course"]
            if not min_credit:
                min_credit = 1
            if not max_credit:
                max_credit = min_credit * 100
            if not min_course:
                min_course = 1
            if not max_course:
                max_course = min_course * 10

            if creditUsed < min_credit or creditUsed > max_credit or courseNum < min_course or courseNum > max_course or not check:
                return ["or", False, courseUsed, creditUsed]
            return ["or", True, courseUsed, creditUsed]

        case "not":
            recursion = switch(code["array"][0]["action"], code["array"][0])
            if recursion[1]:
                return ["not", False, recursion[2], recursion[3]]
            return ["not", True, [], 0]

        case "spread":
            creditUsed = 0
            courseUsed = []
            for i in code["attr"]["array"]:
                courseNum = 0
                areaCourseList = []
                for j in code["attr"]["array"][i]["array"]:
                    recursion = switch(code["attr"]["array"][i]["array"][j]["action"], code["attr"]["array"][i]["array"][j])
                    if recursion[1]:
                        courseNum += 1
                    areaCourseList.append([j, recursion[2]])
                    creditUsed += int(recursion[3])
                courseUsed.append([courseNum, i, areaCourseList])

            courseUsedWithoutNum = []
            for i in range(len(courseUsed)):
                courseUsedWithoutNum.append([courseUsed[i][1], courseUsed[i][2]])

            courseUsed.sort()
            for i in range(len(code["attr"]["min_course_spread"])):
                if courseUsed[len(courseUsed) - 1] < code["attr"]["min_course_spread"]:
                    return ["spread", False, courseUsedWithoutNum, creditUsed]
            return ["spread", True, courseUsedWithoutNum, creditUsed]

        case "pass_course":
            if code["course"] not in user["courses"]:
                return ["pass_course", False, [], 0]
            sem = user["courses"][code["course"]]
            sem = sorted(sem.items())
            if sem[len(sem) - 1][1]["grade"] in notPassGrade:
                return ["pass_course", False, [], 0]
            return ["pass_course", True, [code["course"]], sem[len(sem) - 1][1]["actual_cred"]]

        case "pass_certain_level":
            deptList = []
            if "school" in code:
                match code["school"]:
                    case "SENG":
                        deptList = seng

                    case _:
                        print("Error in school (pass_certain_level)")
                        return ["pass_certain_level", False, [], 0]
            
            if "dept" in code:
                deptList.append(code["dept"])

            if "attr" in code:
                if "excl" in code["attr"]:
                    for i in code["attr"]["excl"]:
                        deptList.remove(i)

            courseCodeList = list(user["courses"].keys())
            courseCodeSep = []
            for i in range(len(courseCodeList)):
                courseCodeSep.append(courseCodeList[i].split())

                # Swaping the positions of dept and numerial code
                courseCodeSep[i].append(courseCodeSep[i][0])
                courseCodeSep[i].remove(courseCodeSep[i][0])

            courseCodeSep.sort()

            count = len(courseCodeSep) - 1
            courseUsed = []

            while (True):
                requiredLevel = 0
                courseLevel = 0
                for i in range(4):
                    requiredLevel += (int(code["level"][i]) * (10 ** (3 - i)))
                    courseLevel += (int(courseCodeSep[count][0][i]) * (10 ** (3 - i)))

                if courseLevel < requiredLevel:
                    break
                if courseCodeSep[count][1] in deptList:
                    fullCourseCode = courseCodeSep[count][1] + ' ' + courseCodeSep[count][0]
                    courseUsed.append(fullCourseCode)
                count -= 1

            min_credit = 0
            max_credit = 0
            min_course = 0
            max_course = 0
            if "attr" in code:
                if "min_credit" in code["attr"]:
                    min_credit = code["attr"]["min_credit"]
                if "credit" in code["attr"]:
                    min_credit, max_credit = code["attr"]["credit"]
                if "max_credit" in code["attr"]:
                    max_credit = code["attr"]["max_credit"]
                if "min_course" in code["attr"]:
                    min_course = code["attr"]["min_course"]
                if "course" in code["attr"]:
                    min_course, max_course = code["attr"]["course"]
                if "max_course" in code["attr"]:
                    max_course = code["attr"]["max_course"]
            if not min_credit:
                min_credit = 1
            if not max_credit:
                max_credit = min_credit * 100
            if not min_course:
                min_course = 1
            if not max_course:
                max_course = min_course * 10

            creditUsed = 0
            for i in courseUsed:
                last = sorted(user["courses"][i].items())
                creditUsed += int(last[len(last) - 1][1]["actual_cred"])

            if len(courseUsed) < min_course or len(courseUsed) > max_course or creditUsed < min_credit or creditUsed > max_credit:
                return ["pass_certain_level", False, courseUsed, creditUsed]
            return ["pass_certain_level", True, courseUsed, creditUsed]
            

        case "pass_qualification":
            if (code["quali"][0] not in user["profile"]["pastQuali"] or  # Exam not in passQuali
                code["quali"][1] not in user["profile"]["pastQuali"][code["quali"][0]] or # Subject not in Exam
                not qualiMapping(code["quali"][0], code["level"], user["profile"]["pastQuali"][code["quali"][0]][code["quali"][1]])): # Mapping failed
                return  ["pass_qualification", False, [], 0]
            return ["pass_qualification", True, [], 0]

        case "approval":
            if ("specialApproval" not in user["profile"] or
                "approvalList" not in user["profile"]["specialApproval"] or
                code["note"] not in user["profile"]["specialApproval"]["approvalList"]):
                return ["approval", False]
            return ["approval", True]

        case _:
            return ["Error", False, [], 0]

# Varibles
cin = "BEng in Computer Engineering"
year = "20"
year += user["profile"]["currentStudies"]["yearOfIntake"][0]
year += user["profile"]["currentStudies"]["yearOfIntake"][1]
notPassGrade = ['F', "AU", "CR", 'I', "PP", 'W']
seng = ["BIEN", "CENG", "CEEV", "CIVL", "CIEV", "CPEG",
        "COMP", "COSC", "ELEC", "IEEM", "ISDN", "MECH"]
creditForMajor = 0

# Check if the input string exists in major/course db
if cin in major[year]:
    recursion = switch(major[year][cin]["action"], major[year][cin])
else:
    print("Error")

print(recursion[2])