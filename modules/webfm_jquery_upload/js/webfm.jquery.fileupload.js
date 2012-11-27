(function($)
{
  Drupal.behaviors.webfm_jquery_upload = {
    attach: function(context) {
      jQuery('.webfm-uploader-form',context).once('.webfm-uploader-form',uploaderInit);
    }
  };

  function uploaderInit()
  {
    var upurl = null;
    $('.webfm-uploader-form input').each(function () {
      if ($(this).attr('name') == 'form_build_id')
      {
        upurl = $(this).val();
      }
    });
    console.log(upurl);
    $('.webfm-uploader-form').fileupload();
    $('.webfm-uploader-form').bind('fileuploadcompleted', 
      function(e,data) { 
        var bridge = new $.webfm.bridge();
        console.log(data);
        for (var fidx in data.result) { 
          if (data.result[fidx].exists && $('#resolution-'+data.result[fidx].id).children().length == 0)
          {
            var itemID = data.result[fidx].id;
            var conflictResolver = bridge.fileConflict(data.result[fidx].name,itemID,data.result[fidx].dest);
            conflictResolver.on('resolved', function(event,resID) 
            { 
              $('#resolution-'+resID).parent().remove();
            });
            $('#resolution-'+itemID).append(conflictResolver);
          }
        } 
        bridge.refreshContent();
      }
    );
    $('.webfm-uploader-form').bind('fileuploadfail', 
      function(e,data) { 
      }
    );
    $('.webfm-uploader-form').fileupload('option', {
            url: Drupal.settings.basePath + 'webfm_file/ajax/webfm_uploader/'+upurl,
            singleFileUploads: false,
            formData: function (form) {
                var trigger;
                form.find('button').each( function(e,d) { if ($(this).data('field')) { trigger = $(this).data('field')}});
                var fdata = form.serializeArray();
                console.log(form);
                fdata.push({name:'_triggering_element_name',value:trigger});
                fdata.push({name:'_triggering_element_value',value: 'upload'});
//                fdata.push({name:'_triggering_element_name',value:'webfm_uploader_upload_button'});
//                fdata.push({name:'_triggering_element_value',value: 'Upload'});
                return fdata;
            },
            process: [
                {
                    action: 'load',
                },
                {
                    action: 'save'
                }
            ],
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url: Drupal.settings.basePath + 'webfm_file/ajax/webfm_uploader/'+upurl,
                type: 'HEAD'
            }).fail(function () {
                $('<span class="alert alert-error"/>')
                    .text('Upload server currently unavailable - ' +
                            new Date())
                    .appendTo('#webfm-uploader-form');
            });
        }
  }

})(jQuery);
