from flask import Flask, request
try:
    TEST = "OK"
    import webServer_helper
    if webServer_helper.version != 1:
        raise Exception("version different")
    app = Flask(__name__)

    @app.route('/')
    def home():
        return {"status": 200}

    @app.route('/!a/', methods = ['GET'])
    def a():
        try:
            return webServer_helper.henya(request.json)
        except:
            return {"status": 400}

    @app.route('/!BlueScreen/')
    def b():
        try:
            raise Exception("凸出")
        except:
            return {"status": 500}

    if __name__ == '__main__':
        app.run(debug=True, port=7003)
except ImportError:
    print("JK lost his file")
except Exception as Argument:
    print(Argument)
