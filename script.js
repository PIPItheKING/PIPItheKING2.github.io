const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').onclick = handleAuthClick;
document.getElementById('signout_button').onclick = handleSignoutClick;

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({ apiKey: API_KEY, discoveryDocs: [DISCOVERY_DOC] });
  gapiInited = true;
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '',
  });
  gisInited = true;
}

function handleAuthClick() {
  tokenClient.callback = (resp) => {
    if (resp.error) throw resp;
    document.getElementById('authorize_button').style.display = 'none';
    document.getElementById('signout_button').style.display = 'block';
  };
  if (gapi.client.getToken() === null) tokenClient.requestAccessToken({ prompt: 'consent' });
  else tokenClient.requestAccessToken({ prompt: '' });
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) google.accounts.oauth2.revoke(token.access_token);
  document.getElementById('authorize_button').style.display = 'block';
  document.getElementById('signout_button').style.display = 'none';
}

async function bookTimeslot(date, time) {
  const event = {
    summary: 'תור חדש',
    start: { dateTime: `${date}T${time}:00`, timeZone: 'Asia/Jerusalem' },
    end: { dateTime: `${date}T${parseInt(time.split(':')[0]) + 2}:00`, timeZone: 'Asia/Jerusalem' },
  };

  try {
    await gapi.client.calendar.events.insert({ calendarId: 'primary', resource: event });
    alert('התור נוסף בהצלחה ליומן!');
  } catch (error) {
    alert('שגיאה בהוספת התור ליומן.');
    console.error(error);
  }
}

function generateCalendar(year, month) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement('div'));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    if (date < today) dayDiv.classList.add('past');
    dayDiv.textContent = day;
    dayDiv.onclick = () => showTimeslots(year, month, day);
    calendar.appendChild(dayDiv);
  }
}

function showTimeslots(year, month, day) {
  const timeslots = document.getElementById('timeslots');
  timeslots.innerHTML = '';
  const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  for (let hour = 9; hour < 17; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`;
    const timeslot = document.createElement('div');
    timeslot.className = 'timeslot';
    timeslot.textContent = time;
    timeslot.onclick = () => bookTimeslot(date, time);
    timeslots.appendChild(timeslot);
  }
}

generateCalendar(new Date().getFullYear(), new Date().getMonth());
