#user input(which major?), user json
#create json file output, number of credits 

"""
1. Check string if have key
2. if in major databae, go to check major
3. return (true/false)
"""

import json
version = 1

# Functions for major
def actionAnd():
    print("and")

def actionOr():
    print("or")

def actionNot():
    print("not")

def actionSpread():
    print("spread")

def actionPass_course():
    print("pass_course")

def actionPass_certain_level():
    print("pass_certain_level")

def actionPass_qualification():
    print("pass_qualification")

def default():
    print("Error in actions")



# Switch for multiple functions
switcher = {
    "and": actionAnd,
    "or": actionOr,
    "not": actionNot,
    "spread": actionSpread,
    "pass_course": actionPass_course,
    "pass_certain_level": actionPass_certain_level,
    "pass_qualification": actionPass_qualification
}
def switch (functionName):
    return switcher.get(functionName, default)()

# Checking function for major
def majorFunction(majorIn):
    if "action" in majorIn:
        if "array" in majorIn:
            for  key, value in majorIn["array"].items():
                majorFunction(majorIn["array"][key])
    
        else:
            switch (majorIn["action"])

# Varible
cin = "BEng in Bioengineering"
user = {}

#From major database
fm = open ("major.json", 'r')
major = json.loads(fm.read())

# From course database
#fc = open ("")
course = {}

# Check if the input string exists in major/course db
if cin in major:
    majorFunction(major[cin])   
elif cin in course:
    print("course")
else:
    print("Error")
    
