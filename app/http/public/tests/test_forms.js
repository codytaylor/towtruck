// =SECTION Setup

$("#fixture").empty();
$("#fixture").append('<textarea id="textarea" style="width: 10em; height: 3em;"></textarea>');
$("#fixture").append('<br>');
$("#fixture").append('<div><label for="yes"><input type="radio" name="answer" id="yes"> Yes</label><label for="no"><input type="radio" name="answer" id="no"> No</label></div>');

getRequire("forms", "session", "ui");
// => Loaded modules: ...

viewSend();
waitMessage("hello");
TowTruck.startup._launch = true;
TowTruck();

/* =>
send: hello
...
*/

session.clientId = "me";

var $yes = $("#yes");
var $no = $("#no");
var $textarea = $("#textarea");

ui.hideWindow("#towtruck-about");

// =SECTION Changes

waitMessage("form-update");
$yes.prop("checked", true);
$yes.change();

/* =>
send: form-update
  {clientId: "me", element: "#yes", value: true}
*/

waitMessage("form-update");
$no.prop("checked", true);
$no.change();

/* =>
send: form-update
  {clientId: "me", element: "#no", value: true}
*/

function selection() {
  var start = $textarea[0].selectionStart;
  var end = $textarea[0].selectionEnd;
  if (typeof start != "number") {
    if (typeof end == "number") {
      console.warn("Weird, end with no start", end);
    }
    return 'no selection';
  }
  print('selected', start, '-', end);
}

function select(start, end) {
  if (end === undefined) {
    end = start;
  }
  $textarea[0].selectionStart = start;
  $textarea[0].selectionEnd = end;
}

waitMessage("form-update");
$textarea.val("hello");
$textarea.change();

/* =>
send: form-update
  {clientId: "me", element: "#textarea", value: "hello"}
*/

select(3, 4);
selection();

waitMessage("form-update");
$textarea.val("hello there");
$textarea.change();

/* =>
selected 3 - 4
send: form-update
  clientId: "me",
  element: "#textarea",
  replace: {len: 0, start: 5, text: " there"}
*/

// This doesn't seem to have a reliable result, but I don't know why...
// but I don't think it matters, since the change is only the result of
// $textarea.val()
selection();

waitMessage("form-update");
$textarea.val("hi there");
$textarea.change();

/* =>
selected ? - ?
send: form-update
  {clientId: "me", element: "#textarea", replace: {len: 4, start: 1, text: "i"}}
*/

select(3, 4);
var incoming = session._getChannel().onmessage;

incoming({
  type: "hello",
  clientId: "faker",
  url: location.href.replace(/\#.*/, ""),
  urlHash: "",
  name: "Faker",
  avatar: "about:blank",
  color: "#ff0000",
  title: document.title,
  rtcSupported: false
});
incoming({
  clientId: "faker",
  type: 'form-update',
  element: "#textarea",
  replace: {start: 1, len: 1, text: "ey"}
});
wait(100);

/* =>

send: hello-back
  avatar: "...",
  clientId: "me",
  color: "...",
  name: "...",
  rtcSupported: ?,
  starting: ?,
  title: "TowTruck tests",
  url: ".../tests/...",
  urlHash: ""
send: form-init
  clientId: "me",
  pageAge: ?,
  updates: [
    {element: "#textarea", value: "hi there"},
    {element: "#yes", value: false},
    {element: "#no", value: true}
  ]
*/

print($textarea.val());
selection();

/* =>
hey there
selected 4 - 5
*/

select(0, 5);
incoming({
  clientId: "faker",
  type: 'form-update',
  element: "#textarea",
  replace: {start: 1, len: 2, text: "ELLO"}
});
wait(100);

// =>

print($textarea.val());
selection();

/* =>
hELLO there
selected 0 - 7
*/

// form-init should be ignored in some cases...
print(Date.now() - TowTruck.pageLoaded > 10);
incoming({
  clientId: "faker",
  type: "form-init",
  pageAge: 10,
  updates: [
    {element: "#textarea",
     value: "foo"
    }
  ]
});
wait(100);

// => true

print($textarea.val());

// => hELLO there
