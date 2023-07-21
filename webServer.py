from flask import Flask, request
import requests

try:
    import globalVarible
    if globalVarible.version != 1:
        raise Exception("version different")
    
    import course_phrasing_B
    if course_phrasing_B.version != 1:
        raise Exception("version different")
    app = Flask(__name__)

    @app.route('/')
    def home():
        print (globalVarible.phrased_course)
        return {"status": 200}
############################
# Data input / Set variable
############################
    @app.route('/!setvar/courses', methods = ['POST'])
    def update_courses():
        try:
            globalVarible.courses = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/courseids', methods = ['POST'])
    def update_courseids():
        try:
            globalVarible.courseids = request.json
            return {"status": 200}
        except:
            return {"status": 400}

    @app.route('/!setvar/coursegroups', methods = ['POST'])
    def update_coursegroups():
        try:
            globalVarible.coursegroups = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/sems', methods = ['POST'])
    def update_sems():
        try:
            globalVarible.sems = request.json
            return {"status": 200}
        except:
            return {"status": 400}
        
    @app.route('/!setvar/insems', methods = ['POST'])
    def update_insems():
        try:
            globalVarible.insems = request.json
            globalVarible.phrased_course = course_phrasing_B.main()
            requests.post("http://localhost:7002/!setvar/", json={"phrasedcourse": globalVarible.phrased_course})
            return {"status": 200}
        except:
            return {"status": 400}
    
    @app.route('/!getvar/phrasedcourse', methods = ['GET'])
    def get_phrased_course():
        try:
            return {"status": 200, "resp": globalVarible.phrased_course}
        except:
            return {"status": 404}

    @app.route('/!checking', methods = ['POST'])
    def checking():
        try:
            return checking_function()
        except:
            return {"status": 404}

    @app.errorhandler(404)
    def page_not_found(error):
        return {"status": 404}

    if __name__ == '__main__':
        app.run(debug=True, port=7003)
except ImportError:
    print("File missing or outdated")
except Exception as Argument:
    print(Argument)