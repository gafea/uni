##############################
# version number
##############################
version = 1

##############################
# main
##############################
import globalVariable
import checking_function_course
import checking_function_major
import recommend_courses

def main(user):
    max_cred = 0
    recommended_course = []
    future_sem = []
    arrange_course_list = {}
    courseids_list = {}
    for i in range(0, 3):
        for j in range(1, 5):
            future_sem.append(
                str(int(globalVariable.sems[0][0:2]) * 100 + i * 100 + j * 10)
            )

    for sem in future_sem:
        if int(sem[2:3]) % 2 == 0:
            max_cred = 9
        else:
            max_cred = 18
        cred_count = 0
        arrange_course_list[sem] = {}
        arrange_course_list[sem]["action"] = "and"
        arrange_course_list[sem]["array"] = []
        data = recommend_courses.main(user)
        recommend_course = course_listing_main(data, user, sem)
        for course in recommend_course:
            check_list_exclu = checking_exclusion(course, recommend_course)
            user.update([["course", [course]]])
            user.update(
                [["prog", [user["userdb"]["profile"]["currentStudies"]["mm"][0]]]]
            )
            check_list_course = checking_function_course.main(user)
            dict = {}
            predict_cred = cred_count + get_credit(course)
            if (check_list_course[course]["pass"] == True and predict_cred <= max_cred):
                if course not in recommended_course and get_credit(course) != 0:
                    arrange_course_list[sem]["array"].append(
                        Recur_function(
                            dict,
                            check_list_exclu[1],
                            course,
                            check_list_exclu,
                            recommended_course,
                        )
                    )
                    cred_count += get_credit(course)
        data = recommend_courses.main(userdb_modify(user, sem, recommended_course))
        recommend_course = course_listing(data, sem)

    for course in recommended_course:
        courseids_list.update([[course, globalVariable.courseids[course]]])

    output = {"arrange": arrange_course_list,
              "courseids": courseids_list}
    return output

def Recur_function(item, action, course, check_list, recommended_course):
    if action == "or":
        item["action"] = "or"
        item["array"] = []
        j = []
        for i in check_list:
            if i == "or" or i == "pass_course":
                continue
            j.append(i)
        for course in j:
            item["array"].append(
                Recur_function(
                    {}, "pass_course", course, check_list, recommended_course
                )
            )
    if action == "pass_course":
        item["action"] = "pass_course"
        item["course"] = course
        recommended_course.append(course)
    return item

def checking_exclusion(course, recommend_course):
    check_list = [course]
    for exclusion_by in globalVariable.arrange_PCG[course]["EXCLUSION-BY"]:
        if exclusion_by in recommend_course:
            coursei = exclusion_by
            for exclusion_by in globalVariable.arrange_PCG[coursei]["EXCLUSION-BY"]:
                if exclusion_by == course:
                    check_list.append("or")
                    check_list.append(coursei)
            break
    check_list.append("pass_course")
    return check_list

def course_listing_main(data, user, sem):
    arrange_PCG = globalVariable.arrange_PCG
    course_list = course_listing(data, sem)
    requirement_courses = Init(user)
    for course in course_list:
        for prereq in globalVariable.arrange_PCG[course]["PRE-REQUISITE-BY"]:
            if prereq not in requirement_courses:
                arrange_PCG[course]["PRE-REQUISITE-BY"].remove(prereq)
    return course_ordering(course_list, arrange_PCG)

def course_listing(data, sem):
    course_list = []
    for course_info in data:
        course = course_info["code"]
        if course_info["sem"][2:] in checking_pattern(course, sem):
            if course_info["sem"][2:] == sem[2:]:
                course_list.append(course)          
    return course_list

def checking_pattern(course, current_sem):
    sems = []
    potential_sems = []
    count = [0, 0, 0, 0]
    for sem in globalVariable.insems[course]:
        sems.append(sem)
    for sem in sems:
        if int(current_sem[:2]) - int(sem[:2]) > 3:
            if sem[2:] == "10":
                count[0] += 1
            elif sem[2:] == "20":
                count[1] += 1
            elif sem[2:] == "30":
                count[2] += 1
            elif sem[2:] == "40":
                count[3] += 1
    for counter in count:
        if counter >= 3:
            potential_sems.append(str((count.index(counter) + 1) * 10))
    return potential_sems

def course_ordering(course_list, arrange_PCG):
    ordered_course_list = []
    for i in range(len(course_list)):
        for j in range(len(ordered_course_list)+1):
            if j == len(ordered_course_list):
                ordered_course_list.insert(j, course_list[i])
                break
            if len(arrange_PCG[course_list[i]]["PRE-REQUISITE-BY"]) >= len(arrange_PCG[ordered_course_list[j]]["PRE-REQUISITE-BY"]):
                ordered_course_list.insert(j, course_list[i])
                break
    return ordered_course_list

def get_credit(course):
    check = globalVariable.courseids[course]["COURSEID"].find(" units)")
    if check == -1:
        return 3
    else:
        return int(globalVariable.courseids[course]["COURSEID"][check - 1])

def userdb_modify(user, sem, recommended_course):
    for course in recommended_course:
        sub_dict = {
            "grade": "P",
            "units": str(get_credit(course)),
            "actual_cred": str(get_credit(course)),
        }
        sems = {sem: sub_dict}
        user["userdb"]["courses"].update([[course[:4] + " " + course[4:], sems]])
    return user

def Init(user):
    checking_list = checking_function_major.main(user)
    course_list = []
    for i in checking_list:
        for j in checking_list[i]["respattr"]["alternative"]:
            for k in j[1]:
                if k not in course_list:
                    course_list.append(k[:4] + k[5:])
    return course_list