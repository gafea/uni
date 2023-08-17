import globalVariable
import recommend_arrange_spm as modeling
import checking_function_course

# Cleaning the Exclusion
def main(user):
    clean_graph = []
    graph = modeling.Init_Graph_main(user)
    for course_list in graph:
        user.update([["course", course_list]])
        for course in course_list:
            result = checking_function_course.main(user)
            if len(course) > 8:
                if course[:8] not in globalVariable.insems:
                    break
            if result[course]["pass"] == False:
                break
            course = course[:4] + " " + course[4:]
            if course in user["userdb"]["courses"].keys():
                break
            clean_graph.append(course_list)
    return clean_graph
