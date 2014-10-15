(function($)
{
  function WebfmMenuHook() {}  
   Drupal.behaviors.webfm_menu_hook = {
    attach: function(context) {
       
      jQuery('#edit-browse-server',context).once('webfm-menu',webfmMenuInit);
    }
  };

  WebfmMenuHook.handleFile = function(path)
  {
    $('#edit-link-path').val(path);
  }

  function webfmMenuInit()
  {
    var browseButton = $('#edit-browse-server');
    browseButton.on('click',webfmHandleBrowse);
    window.WebfmMenuHook = WebfmMenuHook;
  }
  function webfmHandleBrowse(e)
  {
    e.preventDefault();
    window.open('/webfm/browser','_blank','location=no,menubar=no');
  }


})(jQuery);
