$('#mytextarea').tinymce({
  content_style:
    "body {font-size: 24px; line-height: 0.25;}",
  menubar: false,
  branding: false,
  toolbar: false,
  height: 240,
  placeholder: '請輸入文字 ...',
  setup: function (editor) {
    editor.on('keyup', function() {
      let selectedContent = editor.getContent();
      console.log(selectedContent);
      $("#capture").html(selectedContent);
      if(!selectedContent) $("#capture").html("<p>請輸入文字 ...</p>");
    });
  }
});

$('#btnScreenShot').click()



var btn = document.getElementById("btnScreenShot");
btn.addEventListener("mousedown", onScreenShotClick);

function onScreenShotClick(e) {
  var selectedContent = tinymce.get('mytextarea').getContent();
  console.log(selectedContent);
  html2canvas(document.querySelector("#capture"),{backgroundColor:null}).then((canvas) => {
    let a = document.createElement("a");
    a.href = canvas.toDataURL("image/png", 1.0);
    a.download = $("#capture").text() +".png";
    a.click();
  });
}


// // Get the HTML contents of the currently active editor
// // console.debug(tinymce.activeEditor.getContent());



