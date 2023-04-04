# uni

uni is a service that scrape the HKUST Class Schedule & Quota system and perform organisation and analysis on the data gathered.

## Installation

 1. Install [node.js](https://nodejs.org/en/download)

 2. Download the repo
    ```
    git clone https://github.com/gafea/uni/
    cd uni
    ```

 2. Install nodejs dependencies
    ```
    npm install jsdom
    ```

 4. (optional) To start with some data in place, extract ```course.7z``` onto the root folder. The folder structure should look like this:
    ```
    [root]
    | - [cdn]
    |     | - boot.js
    |     ...
    |
    | - [course]
    |     | - [ACCT]
    |     | - [AESF]
    |     ...
    |
    | - course.7z
    | - uni_node.js
    ...
    ```
    The ```course.7z``` could be deleted after extraction.

 5. Start the server and navigate to ```localhost:8002``` on your browser.
    ```
    node uni_node.js
    ```

## Usage

There are several nodejs scripts that has its filename ending with ```_node.js``` in this repo and they serve different purposes. They could be run according to your needs by running ```node [filename]``` in the command prompt/terminal.

### uni_node.js

This is the main server script. It starts two HTTP servers listening at port 8002 and 7002. Port 8002 is designed to face the public internet and 7002 to face internal intranet only. This script also serves as a buffer to cache the course data organised by ```course_cache_node.js```.

#### Port 7002

##### ```GET /!course_cache/```
##### Runs the ```course_cache_node.js```
<br>

##### ```GET /!course_fetch/```
##### Runs the ```course_fetch_node.js```
<br>

##### ```POST /!servar/``` : [JSON]
##### Overwrite the data saved in the script's cache
<br>

##### ```GET /!getvar/[var_name]/``` : [JSON]
##### Retrieve the data stored in that variable used for caching
<br>

#### Port 8002

##### ```/!course/``` : [Array]
##### Returns a list of semesters avaliable in the data
<br>

##### ```/!course/[sem]/```  : [Object]
##### Example: ```/!course/2230/```
##### Returns a list of departments offering courses in that semester
<br>

##### ```/!course/[sem]/[dept]/``` : [Object]
##### Example: ```/!course/2230/COMP/```
##### Returns a list of courses and course attributes offered by that department in that semester
<br>

##### ```/!course/[sem]/[dept]/[course]/``` : [Object]
##### Example: ```/!course/2230/COMP/COMP2011/```
##### Returns the details of that course in that semester
<br>

##### ```/!insem/[course]/``` : [Array]
##### Example: ```/!insem/COMP2011/```
##### Returns a list of semesters offering that course
<br>

##### ```/!room/``` : [Array]
##### Returns a list of rooms appeared in the data
<br>

##### ```/!room/[room]/```  : [Array]
##### Example: ```/!room/LTA/```
##### Returns a list of semesters that have courses using that room
<br>

##### ```/!room/[room]/[sem]/```  : [Object]
##### Example: ```/!room/LTA/2230/```
##### Returns a timetable with a list of courses using that room in that semester
<br>

##### More API usages will be covered in a seperate document.
<br>

### course_cache_node.js

This script gathers the data stored in ```./course/``` folder and read the course data in JSON scraped and formatted by ```course_fetch_node.js```. It organises the data across different files into variables easily readable and trimmable by ```uni_node.js```. It then POSTs the variables to ```uni_node.js``` via the internal API (Port 7002).

### course_fetch_node.js

This script gathers the webpages from the [HKUST Class Schdule & Quota](https://w5.ab.ust.hk/wcq/cgi-bin/) website and format the HTMLs into JSONs using JSdom.

### exam_fetch_node.js

This script gathers the webpages from the [Final Examination Schedule](https://w5.ab.ust.hk/wex/cgi-bin/) website instead and format the HTMLs into JSONs using JSdom.

### aigen_uni_node.js

This script requires an instance of [Stable Diffusion webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui) running on port 7860 with API mode enabled. It feeds each courses' title and description into the API and places the generated pictures into ```.\cdn\uni_ai\``` folder, which would be used as background image of the course.