##############################
# version number
##############################
version = 1

import os
import time
from datetime import date
from datetime import datetime
datex = date.today().strftime('%Y-%m-%d')
timex = datetime.now().strftime("%H:%M:%S")

courses = {}
courseids = {}
coursegroups = {}
sems = []
insems = {} 
phrased_course = {}
major_school_mapping = {}
major = {}
replacement = {}
arrange_PCG = {}

def deathDump(domain, msg, tb):
    tx = datex + "T" + timex
    p = "C:\\webserver\\death\\" + domain + "\\"
    f = str(int(time.time()) * 1000) + ".log"
    s1 = "Domain: " + domain + "\nTime: " + tx + "\nMessage: " + msg + "\n\nTraceback:\n" + tb
    s2 = "Domain: " + domain + "<br>Time: " + tx + "<br>Message: " + msg + "<br><br>The log will be saved at " + p + f + "<br><br>Traceback:<br>" + tb
    if not os.path.exists(p):
        os.makedirs(p)
    with open(p + f, "w") as file:
        file.write(s1)
    return
