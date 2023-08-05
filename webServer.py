import flask
from flask import Flask, request
import requests
import threading
import sys
import traceback

try:
    import globalVariable
    if globalVariable.version != 1:
        raise Exception("version different")
    
    import course_phrasing_B
    if course_phrasing_B.version != 1:
        raise Exception("version different")
    
    import checking_function_course
    if checking_function_course.version != 1:
        raise Exception("version different")
    
    import checking_function_major
    if checking_function_major.version != 1:
        raise Exception("version different")
    
    import recommend_prog
    if recommend_prog.version != 1:
        raise Exception("version different")
    
    import recommend_courses
    if recommend_courses.version != 1:
        raise Exception("version different")
    
    import recommend_arrange_pcg
    if recommend_arrange_pcg.version != 1:
        raise Exception("version different")
    
    import recommend_arrange
    if recommend_arrange.version != 1:
        raise Exception("version different")
############################
# Check if nodejs server is alive
############################

    nodejs_alive_key = ""
    if sys.argv != [] and len(sys.argv) > 1:
        nodejs_alive_key = sys.argv[1]

    def set_interval(func, sec):
        def func_wrapper():
            set_interval(func, sec)
            func()
        t = threading.Timer(sec, func_wrapper)
        t.start()
        return t
    
    def check_if_nodejs_server_alive():
        try:
            r = requests.get("http://localhost:7002/!python7003/" + nodejs_alive_key)
            if (r.status_code != 200):
                print("nodejs server changed, killing this python server")
                r = requests.get("http://localhost:7002/!start7003/")
                exit(1)
        except:
            print("nodejs server not alive, killing python server too")
            exit(1)

    #set_interval(check_if_nodejs_server_alive, 60)

############################

    app = Flask(__name__)
    app.config['JSON_SORT_KEYS'] = False
    flask.json.provider.DefaultJSONProvider.sort_keys = False

    @app.route('/')
    def home():
        return {"status": 200, "watermark": nodejs_alive_key}
    
############################
# Data input / Mutator
############################
    @app.route('/!setvar/replacement', methods = ['POST'])
    def update_replacement():
        try:
            globalVariable.replacement = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/major', methods = ['POST'])
    def update_major():
        try:
            globalVariable.major = request.json
            return {"status": 200}
        except:
            return {"status": 400}


    @app.route('/!setvar/majorschoolmapping', methods = ['POST'])
    def update_majorschoolmapping():
        try:
            globalVariable.major_school_mapping = request.json
            return {"status": 200}
        except:
            return {"status": 400}
    
    @app.route('/!setvar/courses', methods = ['POST'])
    def update_courses():
        try:
            globalVariable.courses = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/courseids', methods = ['POST'])
    def update_courseids():
        try:
            globalVariable.courseids = request.json
            return {"status": 200}
        except:
            return {"status": 400}

    @app.route('/!setvar/coursegroups', methods = ['POST'])
    def update_coursegroups():
        try:
            globalVariable.coursegroups = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/sems', methods = ['POST'])
    def update_sems():
        try:
            globalVariable.sems = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/insems', methods = ['POST'])
    def update_insems():
        try:
            globalVariable.insems = request.json
            globalVariable.phrased_course = course_phrasing_B.main()
            requests.post("http://localhost:7002/!setvar/", json={"phrasedcourse": globalVariable.phrased_course})
            globalVariable.arrange_PCG = recommend_arrange_pcg.main()
            requests.post("http://localhost:7002/!setvar/", json={"pcg": globalVariable.arrange_PCG})
            return {"status": 200}
        except:
            return {"status": 400}
        
############################
# Data output / Accessor
############################
    @app.route('/!getvar/phrasedcourse', methods = ['GET'])
    def get_phrased_course():
        try:
            return {"status": 200, "resp": globalVariable.phrased_course}
        except:
            return {"status": 404}

    @app.route('/!checking/', methods = ['POST'])
    def checking():
        try:
            mxi = request.get_json()
            mx = {}
            if "course" in mxi:
                mx = checking_function_course.main(mxi)
            else:
                mx = checking_function_major.main(mxi)
            return {"status": 200, "resp": mx}
        except Exception as error:
            return {"status": 500}

    @app.route('/!recommend-courses/', methods = ['POST'])
    def recommend_course():
        try:
            request_data = request.get_json()
            output_data = recommend_courses.main(request_data)
            return {"status": 200, "resp": output_data}
        except:
            return {"status": 500}

    @app.route('/!recommend-prog/', methods = ['POST'])
    def recommend_program():
        try:
            request_data = request.get_json()
            output_data = recommend_prog.main(request_data)
            return {"status": 200, "resp": output_data}
        except Exception:
            print(traceback.format_exc())
            return {"status": 500}
    
    @app.route('/!arrange/', methods = ['POST'])
    def recommend_arrange_():
        try:
            request_data = request.get_json()
            output_data = recommend_arrange.main(request_data)
            return {"status": 200, "resp": output_data}
        except:
            return {"status": 500}
    
    @app.errorhandler(404)
    def page_not_found(error):
        return {"status": 404}

    if __name__ == '__main__':
        app.run(debug=True, port=7003)
except ImportError:
    print("File missing or outdated")
except Exception as Argument:
    print(Argument)