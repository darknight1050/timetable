const { exit } = require("process");

const args = process.argv.splice(2);

if (args.length != 2) {
  console.log("Usage: node update.js [username] [password]");
  exit(0);
}

const username = args[0];
const password = args[1];

const subjectColors = {
  Geografie: "#d2d200",
  Biologie: "#17ff17",
  Englisch: "#ffff81",
  Physik: "#ffa64a",
  Mathematik: "#ff3737",
  Geschichte: "#ce765e",
  Chemie: "#64f7da",
  Französisch: "#e77401",
  "Schwerpunktfach Philosophie, Psychologie und Pädagogik": "#42a1ff",
  "Schwerpunktfach Chemie": "#b1d7fc",
  "Schwerpunktfach Biologie": "#7efc7f",
  Deutsch: "#a6feff",
};

const getColorFromSubject = (subject) => {
  const pSBC = (p, c0, c1, l) => {
    let r,
      g,
      b,
      P,
      f,
      t,
      h,
      i = parseInt,
      m = Math.round,
      a = typeof c1 == "string";
    if (typeof p != "number" || p < -1 || p > 1 || typeof c0 != "string" || (c0[0] != "r" && c0[0] != "#") || (c1 && !a)) return null;
    if (!this.pSBCr)
      this.pSBCr = (d) => {
        let n = d.length,
          x = {};
        if (n > 9) {
          ([r, g, b, a] = d = d.split(",")), (n = d.length);
          if (n < 3 || n > 4) return null;
          (x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
        } else {
          if (n == 8 || n == 6 || n < 4) return null;
          if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
          d = i(d.slice(1), 16);
          if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
          else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
        }
        return x;
      };
    (h = c0.length > 9),
      (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
      (f = this.pSBCr(c0)),
      (P = p < 0),
      (t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
      (p = P ? p * -1 : p),
      (P = 1 - p);
    if (!f || !t) return null;
    if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
    else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
    (a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
  };
  return pSBC(-0.12, subjectColors[subject]) || "#ffffff";
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

  eval("var appointmentsData = " + (await getAppointments(new Date("2022-08-15T00:00:00").getTime(), dwrSession)));
  let rooms = [];
  let teachers = [];
  let subjects = [];
  const appointments = appointmentsData.map((cell) => {
    const readCellValues = (cellValues) => cellValues.cellValues[0].value;
    // @ts-ignore
    var cells = cell.cells;

    var room = readCellValues(cells["relRoom"]).split(" ")[1];
    if (rooms.indexOf(room) === -1) rooms.push(room);

    var teacher = readCellValues(cells["relReservation_lecturer_booking.relLecturer_booking"]).split(" / ")[1] || "";
    if (teachers.indexOf(teacher) === -1) teachers.push(teacher);

    var relEventLabel = readCellValues(cells["relEvent.label"]).split(" - ");
    var subject = relEventLabel[0] === "Parallelveranstaltung" ? relEventLabel[1] : relEventLabel[3];
    if (subjects.indexOf(subject) === -1) subjects.push(subject);

    var appointment = {
      startDate: readCellValues(cells["date_from"]),
      endDate: readCellValues(cells["date_till"]),
      title: subject + " (" + room + ")",
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
  fs = require("fs");
  fs.writeFile("./public/data/appointments.json", JSON.stringify(appointments, null, 4), function (err, data) {
    if (err) {
      return console.log(err);
    }
  });
  fs.writeFile("./public/data/resources.json", JSON.stringify(resources, null, 4), function (err, data) {
    if (err) {
      return console.log(err);
    }
  });
};

update();
