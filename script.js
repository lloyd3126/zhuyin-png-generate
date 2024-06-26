$(document).ready(function() {
    $('#fontSizeInput').on('input', function() {
    let fontSizeInput = $("#fontSizeInput").val();
    let letterSpacingInput = $("#letterSpacingInput").val();
    let lineHeightInput = $("#lineHeightInput").val();
    $('#capture').css('fontSize', fontSizeInput + 'px');
    $('#capture').css('letterSpacing', letterSpacingInput + 'px');
    $('#capture').css('lineHeight', lineHeightInput);
  });
  $('#letterSpacingInput').on('input', function() {
     let fontSizeInput = $("#fontSizeInput").val();
    let letterSpacingInput = $("#letterSpacingInput").val();
    let lineHeightInput = $("#lineHeightInput").val();
    $('#capture').css('fontSize', fontSizeInput + 'px');
    $('#capture').css('letterSpacing', letterSpacingInput + 'px');
    $('#capture').css('lineHeight', lineHeightInput);
  });
  $('#lineHeightInput').on('input', function() {
     let fontSizeInput = $("#fontSizeInput").val();
    let letterSpacingInput = $("#letterSpacingInput").val();
    let lineHeightInput = $("#lineHeightInput").val();
    $('#capture').css('fontSize', fontSizeInput + 'px');
    $('#capture').css('letterSpacing', letterSpacingInput + 'px');
    $('#capture').css('lineHeight', lineHeightInput);
  });
});

$('#mytextarea').tinymce({
  content_style:
    `
    body {font-size: 24px; line-height: 0.25;} 
    @font-face { font-family: 'BpmfZihiSans-Regular'; src: url('./BpmfZihiSans-Regular.ttf') format('truetype')}
    @font-face { font-family: 'BpmfZihiSans-Medium'; src: url('./BpmfZihiSans-Medium.ttf') format('truetype')}
    `,
  menubar: false,
  branding: false,
  toolbar: "forecolor fontfamily",
  color_map: [
    '#754226', '咖啡色',
    '#EC3131', '紅色',
    '#1F324D', '深藍色',
  ],
  height: 240,
  font_family_formats: '一般=BpmfZihiSans-Regular;粗體=BpmfZihiSans-Medium',
  placeholder: '請輸入文字 ...',
  setup: function (editor) {
    editor.on('keyup', function() {
      let selectedContent = editor.getContent();
      console.log(selectedContent);
      $("#capture").html(selectedContent);
      if(!selectedContent) $("#capture").html("<p>請輸入文字 ...</p>");
      let fontSizeInput = $("#fontSizeInput").val();
      let letterSpacingInput = $("#letterSpacingInput").val();
      let lineHeightInput = $("#lineHeightInput").val();
      $('#capture').css('fontSize', fontSizeInput + 'px');
      $('#capture').css('letterSpacing', letterSpacingInput + 'px');
      $('#capture').css('lineHeight', lineHeightInput);
    });
    editor.on('change', function() {
      let selectedContent = editor.getContent();
      console.log(selectedContent);
      $("#capture").html(selectedContent);
      if(!selectedContent) $("#capture").html("<p>請輸入文字 ...</p>");
      let fontSizeInput = $("#fontSizeInput").val();
      let letterSpacingInput = $("#letterSpacingInput").val();
      let lineHeightInput = $("#lineHeightInput").val();
      $('#capture').css('fontSize', fontSizeInput + 'px');
      $('#capture').css('letterSpacing', letterSpacingInput + 'px');
      $('#capture').css('lineHeight', lineHeightInput);
    });
  }
});

$('#btnScreenShot').click()

var btn = document.getElementById("btnScreenShot");
btn.addEventListener("mousedown", onScreenShotClick);

function onScreenShotClick(e) {
  var selectedContent = tinymce.get('mytextarea').getContent();
  console.log(selectedContent);
  html2canvas(
    document.querySelector("#capture"), {
      backgroundColor:null,
      dpi: 300
    }
  ).then(
    (canvas) => {
      let a = document.createElement("a");
      a.href = canvas.toDataURL("image/png", 1.0);
      a.download = $("#capture").text() +".png";
      a.click();
    }
  );
}


// // Get the HTML contents of the currently active editor
// // console.debug(tinymce.activeEditor.getContent());



