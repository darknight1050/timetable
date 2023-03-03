if(typeof fetch !== 'function')
  fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const { exit } = require("process");

const args = process.argv.splice(2);

if (args.length < 3) {
  console.log("Usage: node update.js [startdate] [username] [password] [outdir] [combine]");
  exit(0);
}

const startDate = new Date(args[0].replace(/(\d+[.])(\d+[.])/, '$2$1'));
const username = args[1];
const password = args[2];
const dataDir = (args[3] || "./public") + "/data/";
const combine = (args[4] || false);

const subjectColors = {
  Geografie: "#d2d200",
  Biologie: "#17ff17",
  Englisch: "#ffff81",
  Physik: "#ffa64a",
  Mathematik: "#ff3737",
  "Geschichte und Staatslehre": "#ce765e",
  Chemie: "#64f7da",
  Französisch: "#e77401",
  "Schwerpunktfach Philosophie, Psychologie und Pädagogik": "#42a1ff",
  "Schwerpunktfach Chemie": "#b1d7fc",
  "Schwerpunktfach Biologie": "#7efc7f",
  Deutsch: "#a6feff",
  "Bildnerisches Gestalten": "#fc51c9",
  "Wissenschaftliches Arbeiten / Maturaarbeit": "#a10ffc",
  
};

const getColorFromSubject = (subject) => {
  return subjectColors[subject] || "grey";
};

const tokenify = (number) => {
  var tokenbuf = [];
  var charmap = "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ*$";
  var remainder = number;
  while (remainder > 0) {
    tokenbuf.push(charmap.charAt(remainder & 63));
    remainder = Math.floor(remainder / 64);
  }
  return tokenbuf.join("");
};

const getBetween = (data, before, after) => {
  const begin = data.indexOf(before) + before.length;
  return data.substring(begin, data.indexOf(after, begin));
};

let cookies = new Map();

const setCookies = (response) => {
  const raw = response.headers.get("set-cookie").split(", ");
  raw.forEach((cookie) => {
    const splitted = cookie.split("; ")[0].split("=");
    cookies.set(splitted[0], splitted[1]);
  });
};

const getCookies = () => {
  let text = "";
  cookies.forEach((value, name) => {
    text += name + "=" + value + "; ";
  });
  return text.substring(0, text.length - 2);
};

const cookieFetch = (url, opts) => {
  opts["headers"]["cookie"] = getCookies();
  console.log(opts);
  return fetch(url, opts).then((response) => {
    setCookies(response);
    return response;
  });
};

const getDwrSession = async () => {
  return cookieFetch("https://akad.tocco.ch/nice2/dwr/call/plaincall/__System.generateId.dwr", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,de;q=0.8",
      "content-type": "text/plain",
    },
    body: "callCount=1\nc0-scriptName=__System\nc0-methodName=generateId\nc0-id=0\nbatchId=0\ninstanceId=0\npage=%2Fweb%2FServices%2FLogin\nscriptSessionId=\n",
    method: "POST",
    credentials: "include",
  })
    .then((response) => response.text())
    .then((response) => getBetween(response, 'dwr.engine.remote.handleCallback("0","0","', '"'));
};

const login = async (username, password) => {
  await cookieFetch("https://akad.tocco.ch/nice2/login", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,de;q=0.8",
      "content-type": "application/x-www-form-urlencoded; charset=utf-8",
    },
    body: "password=" + password + "&username=" + username,
    method: "POST",
    credentials: "include",
  })
    .then((response) => response.text())
    .then((response) => console.log(response));
};

const getAppointments = async (date_from, dwrSession) => {
  const maxCount = 1000;
  const scriptSessionId = dwrSession + "/" + tokenify(new Date().getTime()) + "-" + tokenify(Math.random() * 10000000000000000);
  return cookieFetch("https://akad.tocco.ch/nice2/dwr/call/plaincall/nice2_netui_SearchService.search.dwr", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,de;q=0.8",
      "content-type": "text/plain",
    },
    body:
      "callCount=1\nc0-scriptName=nice2_netui_SearchService\nc0-methodName=search\nc0-id=0\nc0-param0=array:[]\nc0-e3=boolean:true\nc0-e4=string:entity%3A%2F%2FReservation%2F~1%2Fdate_from\nc0-e5=string:date_from\nc0-e7=string:datetime\nc0-e8=date:" +
      date_from +
      "\nc0-e6=Object_Object:{type:reference:c0-e7, value:reference:c0-e8}\nc0-e10=string:datetime\nc0-e11=null:null\nc0-e9=Object_Object:{type:reference:c0-e10, value:reference:c0-e11}\nc0-e12=number:0\nc0-e2=Object_entity.RangeRebindValue:{dirty:reference:c0-e3, fieldUri:reference:c0-e4, componentId:reference:c0-e5, from:reference:c0-e6, to:reference:c0-e9, version:reference:c0-e12}\nc0-e14=boolean:true\nc0-e15=string:entity%3A%2F%2FReservation%2F~1%2FrelEvent%2F~1%2FrelBusiness_unit\nc0-e17=string:entity%3A%2F%2FBusiness_unit%2F1\nc0-e16=array:[reference:c0-e17]\nc0-e18=string:relEvent.relBusiness_unit\nc0-e19=array:[]\nc0-e21=string:entity%3A%2F%2FBusiness_unit%2F1\nc0-e20=array:[reference:c0-e21]\nc0-e22=boolean:true\nc0-e23=number:0\nc0-e13=Object_entity.SelectionRebindValue:{dirty:reference:c0-e14, fieldUri:reference:c0-e15, total:reference:c0-e16, componentId:reference:c0-e18, removed:reference:c0-e19, added:reference:c0-e20, multiple:reference:c0-e22, version:reference:c0-e23}\nc0-e1=array:[reference:c0-e2,reference:c0-e13]\nc0-e25=string:\nc0-e26=string:\nc0-e27=string:date_from\nc0-e28=string:date_till\nc0-e29=string:hint\nc0-e30=string:relRoom\nc0-e31=string:relRoom.relBuilding.relBuilding_group\nc0-e32=string:relReservation_lecturer_booking.relLecturer_booking\nc0-e33=string:relEvent.label\nc0-e24=array:[reference:c0-e25,reference:c0-e26,reference:c0-e27,reference:c0-e28,reference:c0-e29,reference:c0-e30,reference:c0-e31,reference:c0-e32,reference:c0-e33]\nc0-e35=number:0\nc0-e36=number:" +
      maxCount +
      "\nc0-e34=Object_searchService.Paging:{offset:reference:c0-e35, limit:reference:c0-e36}\nc0-e38=string:OwnTimeTable_list\nc0-e39=string:list\nc0-e37=Object_form.FormIdentifier:{formName:reference:c0-e38, scope:reference:c0-e39}\nc0-e41=string:OwnTimeTable_search\nc0-e42=string:search\nc0-e40=Object_form.FormIdentifier:{formName:reference:c0-e41, scope:reference:c0-e42}\nc0-e43=null:null\nc0-e44=null:null\nc0-e45=null:null\nc0-e46=string:Reservation\nc0-e47=null:null\nc0-e48=null:null\nc0-e49=array:[]\nc0-e50=boolean:true\nc0-e53=string:date_from\nc0-e54=string:ASC\nc0-e52=Object_searchService.OrderItem:{path:reference:c0-e53, direction:reference:c0-e54}\nc0-e51=array:[reference:c0-e52]\nc0-e55=null:null\nc0-param1=Object_nice2.netui.SearchParameters:{queryParams:reference:c0-e1, columns:reference:c0-e24, paging:reference:c0-e34, listForm:reference:c0-e37, searchForm:reference:c0-e40, constrictionParams:reference:c0-e43, relatedTo:reference:c0-e44, doubletFilter:reference:c0-e45, entityName:reference:c0-e46, pks:reference:c0-e47, manualQuery:reference:c0-e48, searchFilters:reference:c0-e49, skipDefaultDisplay:reference:c0-e50, order:reference:c0-e51, searchFilter:reference:c0-e55}\nbatchId=1\ninstanceId=0\npage=%2FMy-AKAD%2FStundenplan\nscriptSessionId=" +
      scriptSessionId +
      "\n",
    method: "POST",
    credentials: "include",
  })
    .then((response) => response.text())
    .then((response) => getBetween(response, "returnValue:{rows:", ",sendingRows:"));
};

const update = async () => {
  const dwrSession = await getDwrSession();
  cookies.set("DWRSESSIONID", dwrSession);
  await login(username, password);

  const newObject = (name, value) => {
    return value;
  };

  function PrimaryKey(value) {
    this.value = value;
  }

  const dwr = { engine: { remote: { newObject: newObject } } };
  const nice2 = { entity: { PrimaryKey: PrimaryKey } };

  eval("var appointmentsData = " + (await getAppointments(startDate.getTime(), dwrSession)));
  let rooms = [];
  let teachers = [];
  let subjects = [];
  let appointments = appointmentsData.map((cell) => {
    const readCellValues = (cellValues) => cellValues.cellValues[0].value;
    // @ts-ignore
    var cells = cell.cells;

    var room = readCellValues(cells["relRoom"]).split(" ")[1];
    if (rooms.indexOf(room) === -1) rooms.push(room);

    var teacher = readCellValues(cells["relReservation_lecturer_booking.relLecturer_booking"]).split(" / ")[1] || "";
    if (teachers.indexOf(teacher) === -1) teachers.push(teacher);

    var relEventLabel = readCellValues(cells["relEvent.label"]).split("- ");
    var subject = (relEventLabel[0] === "Parallelveranstaltung" || relEventLabel[0] === "Parallelveranstaltung ") ? relEventLabel[1] : relEventLabel[3];
    if (subjects.indexOf(subject) === -1) subjects.push(subject);

    var appointment = {
      startDate: readCellValues(cells["date_from"]),
      endDate: readCellValues(cells["date_till"]),
      title: subject,
      room: room,
      teacher: teacher,
      subject: subject,
    };
    return appointment;
  });
  let resources = [
    { fieldName: "room", title: "Raum", instances: rooms.map((room) => ({ id: room, text: room })) },
    { fieldName: "teacher", title: "Lehrer", instances: teachers.map((teacher) => ({ id: teacher, text: teacher })) },
    { fieldName: "subject", title: "Fach", instances: subjects.map((subject) => ({ id: subject, text: subject, color: getColorFromSubject(subject) })) },
  ];
  console.log("Got appointments: " + appointments.length);
  if(appointments.length > 0) {  
    fs = require("fs");
    if(combine) {
      console.log("Combining...");
      let origAppointments = JSON.parse(fs.readFileSync(dataDir + "appointments.json"));
      appointments = appointments.concat(origAppointments.filter((origAppointment) => appointments.findIndex((newAppointment) => {
        return JSON.stringify(origAppointment) === JSON.stringify(newAppointment);
      }) < 0));
      let origResources = JSON.parse(fs.readFileSync(dataDir + "resources.json"));
      resources = resources.concat(origResources.filter((origResource) => resources.findIndex((newResource) => {
        return JSON.stringify(origResource) === JSON.stringify(newResource);
      }) < 0));

    }
    console.log("Writing to outdir: " + dataDir);
    fs.writeFile(dataDir + "appointments.json", JSON.stringify(appointments, null, 4), function (err, data) {
      if (err) {
        return console.log(err);
      }
    });
    fs.writeFile(dataDir + "resources.json", JSON.stringify(resources, null, 4), function (err, data) {
      if (err) {
        return console.log(err);
      }
    });
  }
};

update();
