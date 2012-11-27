(function($)
{
  
  CKEDITOR.plugins.add('webfm', {
    init: function(editor, pluginPath) {
       editor.config.filebrowserBrowseUrl = Drupal.settings.basePath + '/webfm/browser';
    }
  });
})(jQuery);

