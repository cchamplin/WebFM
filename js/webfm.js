(function($)
{
  /* namespace */
  function Webfm() {}
  Webfm.debug = true;
  Webfm.lang = [];
//  Webfm.lang. = Drupal.t('');
  Webfm.lang.confirm_delete_file = Drupal.t('Are you sure you want to delete this file?');
  Webfm.lang.confirm_delete_directory = Drupal.t('Are you sure you want to delete this directory and ALL files under it?');
  Webfm.lang.confirm_move_directory = Drupal.t('Are you sure you want to move this directory and ALL files under it?');
  Webfm.lang.submit = Drupal.t('Submit');
  Webfm.lang.create = Drupal.t('Create');
  Webfm.lang.rename = Drupal.t('Rename');
  Webfm.lang.delete = Drupal.t('Delete');
  Webfm.lang.confirm_delete = Drupal.t('Confirm delete');
  Webfm.lang.loading = Drupal.t('Loading');
  Webfm.lang.resource_error = Drupal.t('Error requesting online resource');
  Webfm.lang.file_move = Drupal.t('Move file');
  Webfm.lang.file_delete = Drupal.t('Delete file');
  Webfm.lang.file_rename = Drupal.t('Rename file');
  Webfm.lang.file_replace = Drupal.t('Replace file');
  Webfm.lang.file_view = Drupal.t('View file');
  Webfm.lang.file_download = Drupal.t('Download file');
  Webfm.lang.file_pastelink = Drupal.t('Paste link in editor window');
  Webfm.lang.toeditor = Drupal.t('Send to editor');
  Webfm.lang.directory_create = Drupal.t('Create directory');
  Webfm.lang.directory_create_prompt = Drupal.t('Enter a name for the directorty');
  Webfm.lang.directory_createsub = Drupal.t('Create Sub-Directory');
  Webfm.lang.directory_createsub_prompt = Drupal.t('Enter a name for the sub directorty');
  Webfm.lang.directory_delete = Drupal.t('Remove directory');
  Webfm.lang.directory_rename = Drupal.t('Rename directory');
  Webfm.lang.directory_search = Drupal.t('Search directory');
  Webfm.lang.directory_move = Drupal.t('Move directory');
  Webfm.lang.refresh = Drupal.t('Refresh');
  Webfm.lang.expand = Drupal.t('expand');
  Webfm.lang.collapse = Drupal.t('collapse');
  Webfm.lang.expandtree = Drupal.t('expand tree');
  Webfm.lang.collapsetree = Drupal.t('collapse tree');
  Webfm.lang.name = Drupal.t('Name');
  Webfm.lang.modified = Drupal.t('Modified');
  Webfm.lang.size = Drupal.t('Size');
  Webfm.lang.sort = Drupal.t('Sort by this column');
  Webfm.lang.file = Drupal.t('File');
  Webfm.lang.directory = Drupal.t('Directory');
  Webfm.lang.conflict = Drupal.t('File upload conflict');
  Webfm.lang.conflict_desc = Drupal.t('A file already exists with that name, please select one of the available options');
  Webfm.lang.overwrite = Drupal.t('Replace the existing file with the new one');
  Webfm.lang.rename_existing = Drupal.t('Rename the existing file');
  Webfm.lang.rename_new = Drupal.t('Rename the newly uploaded file');
  Webfm.lang.conflict_cofirm_rename_existing = Drupal.t('Enter a new file name for the existing file');
  Webfm.lang.conflict_cofirm_rename_new = Drupal.t('Enter a new file name for the new file');
  Webfm.lang.conflict_error = Drupal.t('Could not resolve conflict, did you try to rename to a file that already exists?');
  Webfm.lang.error = Drupal.t('Error');
  Webfm.lang.cancel = Drupal.t('Cancel the upload');
Webfm.icons = {
  loader: "loader",
  epdf: "pdf",
  ephp: "php",
  ephps: "php",
  ephp4: "php",
  ephp5: "php",
  eswf: "swf",
  esfa: "swf",
  exls: "xls",
  eods: "xls",
  edoc: "doc",
  ertf: "doc",
  eodt: "doc",
  eodd: "doc",
  ezip: "zip",
  erar: "zip",
  egz: "zip",
  e7z: "zip",
  etxt: "doc",
  echm: "hlp",
  ehlp: "hlp",
  enfo: "nfo",
  expi: "xpi",
  ec: "c",
  eh: "h",
  emp3: "mp3",
  ewav: "mp3",
  esnd: "mp3",
  einc: "cod",
  esql: "sql",
  edbf: "sql",
  ediz: "nfo",
  eion: "nfo",
  emod: "mp3",
  es3m: "mp3",
  eavi: "avi",
  empg: "avi",
  empeg: "avi",
  ewma: "mp3",
  ewmv: "avi",
  edwg: "dwg",
  ejpg: "i",
  ejpeg: "i",
  egif: "i",
  epng: "i",
  etiff: "i",
  ebmp: "i",
  eico: "i",
  eai: "ai",
  eskp: "skp",
  emov: "qt",
  epps: "pps",
  eppt: "pps"
  };

  Drupal.behaviors.webfm = {
    attach: function(context) {
      jQuery('#webfm',context).once('webfm',webfmInit);
    }
  };
  Webfm.conflict_choices = ['overwrite','rename_new','rename_existing','cancel'];
  Webfm.elements = [];
  Webfm.elements.container = null;
  Webfm.elements.tree = null; 
  Webfm.elements.error = null;
  Webfm.elements.loading = null;
  Webfm.elements.confirmation = null;
  Webfm.elements.attachments = null;
  Webfm.error = [];
  Webfm.confirmation = [];
  Webfm.loading = [];
  Webfm.data = [];
  Webfm.data.attachments = null;
  Webfm.data.directoryTree = null;
  Webfm.data.fileManager = null;
  function webfmInit()
  {
    if (Webfm.debug)
    {
      console.log("Init");
      console.log("Basepath: " + Drupal.settings.basePath);
    }
    //Locate container
    Webfm.elements.container = $("#webfm");
    Webfm.loadInterface();
    Webfm.loadFileData();
    Webfm.handleAttachments();
  }
  Webfm.handleAttachments = function()
  {
    var maxAttachments = Webfm.elements.container.data('max-attachments');
    var fParent = Webfm.elements.container.parents('form');
    if (fParent && fParent.length > 0)
    {
       
       //In a form
       fParent.find('input').each( 
          function() {
            var n = $(this).attr('name');
            if (n && n.indexOf('[webfm_attachments]') != -1)
            {
              var nm = n.split('][');
              nm.pop();
              n = nm.join('][') + ']';
              if (Webfm.data.attachments == null)
                Webfm.data.attachments = new Webfm.attachments(n, maxAttachments);
            }
          }
       );
    }
  }

  Webfm.loadInterface = function ()
  {
    Webfm.elements.tree = $('<div></div>').attr({id : 'webfm-tree'});
    Webfm.elements.error = $('<div></div>').attr({id : 'webfm-error'});
    Webfm.elements.confirmation = $('<div></div>').attr({id: 'webfm-confirm'});
    Webfm.elements.loading = $('<div></div>').attr({id : 'webfm-loading'});
    Webfm.elements.attachments = $('<div></div>').attr({id : 'webfm-attachments'});
    Webfm.elements.container.prepend(Webfm.elements.attachments);
    Webfm.elements.container.append(Webfm.elements.tree);
    Webfm.elements.container.append(Webfm.elements.error);
    Webfm.elements.container.append(Webfm.elements.loading);
    Webfm.elements.container.append(Webfm.elements.confirmation);
  }
  Webfm.loadFileData = function ()
  {
    Webfm.data.directoryTree = new Webfm.dataTree();
    Webfm.data.fileManager = new Webfm.fileManager();
  }

  /*************************
  ****_****
  *************************/
  /*************************
  ****File Cache****
  *************************/
  Webfm.fCache = function()
  {
    this.root = null;
  }
  Webfm.fCache.prototype.addRoot = function()
  {
    this.root = new Webfm.fCache.dirRecord('/', 0);
  }
  Webfm.fCache.prototype.updateDirectory = function(rootObj)
  {
    var pathText = rootObj.p.substring(1);
    var fullPath = pathText.split('/');
    //fullPath.shift();
    if (fullPath.length == 0)
    {
      this.root.modified = rootObj.m;
    }
    else
    {
      if (rootObj.mv)
      {
         var dirObj = this.findDir(rootObj.p);
         if (!dirObj && Webfm.debug)
           console.log("Unable to find original");   
         this.removeDirectory(rootObj);
         this.insertDirectory(rootObj.mv, dirObj);
      }

      this.root.updateDir(rootObj,fullPath);
    }
  }
  Webfm.fCache.prototype.addDirectory = function(dirObject)
  {
    var pathText = dirObject.p.substring(1);
    var fullPath = pathText.split('/');
    //fullPath.shift();
    this.root.addDirectory(dirObject,fullPath);
  }
  Webfm.fCache.prototype.insertDirectory = function(path,dirObject)
  {
    var pathText = path.substring(1);
    var fullPath = pathText.split('/');
    //fullPath.shift();
    this.root.insertDirectory(dirObject,fullPath);
  }
  Webfm.fCache.prototype.removeDirectory = function(dirObject)
  {
    var pathText = dirObject.p.substring(1);
    var fullPath = pathText.split('/');
    //fullPath.shift();
    this.root.removeDirectory(dirObject,fullPath);
  }
  Webfm.fCache.prototype.findDir = function(directory)
  {
    var pathText = directory.substring(1);
    if (pathText == '/')
      return this.root;
    var fullPath = pathText.split('/');
    //fullPath.shift();
    return this.root.findDirectory(fullPath);
  }
  Webfm.fCache.prototype.addFile = function(fileObject)
  {
    var fullPath = fileObject.p.substring(1).split('/');
    //fullPath.shift();
    this.root.addFile(fileObject,fullPath);
  }
  Webfm.fCache.prototype.removeFile = function(fileObject)
  {
    var fullPath = fileObject.p.substring(1).split('/');
    //fullPath.shift();
    this.root.removeFile(fileObject,fullPath);
  }
  Webfm.fCache.fileRecord = function(fileName,fileModified,fileExt,fileSize,fileID)
  {
    this.name = fileName;
    this.modified = fileModified;
    this.ext = fileExt;
    this.size = fileSize;
    this.fid = fileID;
  }
  Webfm.fCache.dirRecord = function(dirName,dirModified)
  {
    this.cached = false;
    this.name = dirName;
    this.files = [];
    this.directories = [];
    this.modified = dirModified;
  }
  Webfm.fCache.dirRecord.prototype.updateDir = function(rootObj, fullPath)
  {
    var searchDir = fullPath.shift();
    if (searchDir != undefined)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == searchDir)
        {
          d.updateDir(rootObj,fullPath);
          return;
        }
      }
    }
    if (fullPath.length == 0)
    {
      if (rootObj.nn)
      {
        this.name = rootObj.nn;
      }
      this.modified = rootObj.m;
    }
  }
  Webfm.fCache.dirRecord.prototype.addFile = function(dirFile,fullPath)
  {
    //this.cached = true;
    var searchDir = fullPath.shift();
    if (searchDir != undefined)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == searchDir)
        {
          d.addFile(dirFile,fullPath);
          return;
        }
      }
    }
    if (fullPath.length == 0)
    {
      for (var fidx in this.files)
      {
        if (this.files[fidx].name == dirFile.n)
        {
          this.files[fidx] = new Webfm.fCache.fileRecord(dirFile.n,dirFile.m,dirFile.e,dirFile.s,dirFile.id);
          return;
        }
      }
      this.files.push(new Webfm.fCache.fileRecord(dirFile.n,dirFile.m,dirFile.e,dirFile.s,dirFile.id));
    }
    //TODO Asserts
  }
  Webfm.fCache.dirRecord.prototype.removeFile = function(dirFile,fullPath)
  {
    //this.cached = true;
    var searchDir = fullPath.shift();
    if (searchDir != undefined)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == searchDir)
        {
          d.removeFile(dirFile,fullPath);
          return;
        }
      }
    }
    if (fullPath.length == 0)
    {
      for (var fidx in this.files)
      {
        if (this.files[fidx].name == dirFile.n)
        {
          this.files.splice(fidx,1);
          break;
        }
      }
    }
    //TODO Asserts
  }

  Webfm.fCache.dirRecord.prototype.removeDirectory = function(dirDirectory,fullPath)
  {
    //this.cached = true;
    var searchDir = fullPath.shift();
    for (var didx in this.directories)
    {
      var d = this.directories[didx];
      if (d.name == searchDir)
      {
        if (fullPath.length == 0)
        {
          this.directories.splice(didx,1);
          return;
        }
        else
        {
          d.removeDirectory(dirDirectory,fullPath);
          return;
        }
      }
    }
  }
  Webfm.fCache.dirRecord.prototype.addDirectory = function(dirDirectory,fullPath)
  {
    //this.cached = true;
    var searchDir = fullPath.shift();
    if (fullPath.length > 0)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == searchDir)
        {
          d.addDirectory(dirDirectory,fullPath);
          return;
        }
      }
      var nDir = new Webfm.fCache.dirRecord(searchDir,-1);
      this.directories.push(nDir);
      nDir.addDirectory(dirDirectory,fullPath);
      return;
    }
    if (fullPath.length == 0)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == dirDirectory.n || d.name == searchDir)
        {
          if (dirDirectory.n)
            this.directories[didx] = new Webfm.fCache.dirRecord(dirDirectory.n,dirDirectory.m);
          else
            this.directories[didx] = new Webfm.fCache.dirRecord(searchDir,dirDirectory.m);
          return;
        }
      }
      if (dirDirectory.n)
      {
        this.directories.push(new Webfm.fCache.dirRecord(dirDirectory.n,dirDirectory.m));
      }
      else
      {
        this.directories.push(new Webfm.fCache.dirRecord(searchDir,dirDirectory.m));
      }
    }
    else if (Webfm.debug)
    {
      console.log("Unable to add directory");
    }
    //TODO Asserts
  }
  Webfm.fCache.dirRecord.prototype.insertDirectory = function(dirDirectory,fullPath)
  {
    var searchDir = fullPath.shift();
    if (fullPath.length > 0)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == searchDir)
        {
          d.insertDirectory(dirDirectory,fullPath);
          return;
        }
      }
      var nDir = new Webfm.fCache.dirRecord(searchDir,-1);
      this.directories.push(nDir);
      nDir.insertDirectory(dirDirectory,fullPath);
      return;
    }
    if (fullPath.length == 0)
    {
      for (var didx in this.directories)
      {
        var d = this.directories[didx];
        if (d.name == dirDirectory.name)
        {
          this.directories[didx] = dirDirectory;
          return;
        }
      }
      this.directories.push(dirDirectory);
    }
    else if (Webfm.debug)
    {
      console.log("Unable to insert directory");
    }
    //TODO Asserts
  }

  Webfm.fCache.dirRecord.prototype.findDirectory = function(fullPath)
  {
    var dj = this;
    var searchDir = fullPath.shift();
    for (var didx in this.directories)
    {
      var d = this.directories[didx];
      if (d.name == searchDir)
      {
        if (fullPath.length == 0)
        {
          return d;
        }
        else
        {
          return d.findDirectory(fullPath);
        }
      }
    }
    //else
    //{
      if (Webfm.debug)
        console.log("Failed to find directory");
      return null;
    //}
    //TODO Asserts
  }
  /*************************
  ****Communication Bridge****
  *************************/
  Webfm.bridge = function()
  {
  }
  Webfm.bridge.prototype.refreshContent = function()
  {
    var obj = Webfm.data.fileManager;
    Webfm.dataRequest('updatecheck', function(data,ob) { obj.dataUpdateCheckCallback(data,ob); }, obj, obj.currentDirectoryPath);
  }
  Webfm.bridge.prototype.fileConflict = function (filename,fid,dest)
  {
    var obj = Webfm.data.fileManager;
    var conflictResolver,tSpan,tForm,tList,tLI,tOpt,tSubmit;
    conflictResolver = $('<div></div>').attr({'id':'webfm-conflict-'+fid,'title':filename});;
    tSpan = $('<span></span>').addClass('conflict-desc').text(Webfm.lang.conflict_desc);
    conflictResolver.append(tSpan);
    
    tForm = $('<form></form>').addClass('conflict-resolution-selector');
    tList = $('<ul></ul>').addClass('conflict-resolution-list');
    for (var tidx in Webfm.conflict_choices)
    {
      tLI = $('<li></li>').addClass('conflict-resolution-item');
      tOpt = $('<input type="radio" name="webfm-conflict-'+fid+'"/>').addClass('conflict-choice').addClass('choice-'+Webfm.conflict_choices[tidx]);
      tSpan = $('<span></span>').addClass('conflict-choice-desc').addClass('choice-'+Webfm.conflict_choices[tidx]+'-desc').text(Webfm.lang[Webfm.conflict_choices[tidx]]);
      tOpt.attr({'data-fid':fid}).val(Webfm.conflict_choices[tidx]);
      tLI.append(tOpt);
      tLI.append(tSpan);
      tList.append(tLI);
    }

    tForm.append(tList);
    tSubmit = $('<input type="button"/>').addClass('conflict-button').val(Webfm.lang.submit);
    tSubmit.on('click', function (event) { obj.ui.handleConflictClick(event,$(this),fid,filename,dest,obj); });
    tForm.append(tSubmit);
    
    conflictResolver.append(tForm);
    return conflictResolver;
  }
  /*************************
  ****File Manager****
  *************************/
  Webfm.fileManager = function()
  {
    var obj = this;
    this.ui = new Webfm.fileManager.ui();
    this.fileCache = new Webfm.fCache();
    this.fileCache.addRoot();
    this.presentWorkingDirectory = null;
    this.currentDirectoryPath = null;
    this.fileContainer = null;
    this.breadCrumb = null;
    Webfm.dataRequest('readfiles', function(data,ob) { obj.dataCallback(data,ob); }, obj);
  }
  Webfm.fileManager.prototype.dataCallback = function (result, obj)
  {
    var tDir = obj.fileCache.findDir(result.root.p);
    if (!tDir)
      obj.fileCache.addDirectory(result.root);
    obj.ui.populateFileManager(result,obj);
    obj.fileCache.updateDirectory(result.root);
    obj.dataRefreshCallback(result,obj);
  }
  Webfm.fileManager.ui = function() { }
  Webfm.fileManager.ui.prototype.populateFileManager = function(result, obj)
  {
    var elDirList, elTable,elTr,elTopTr, elTd,elTBody,elTHead, elRefresh, elSpan, elCreate, elSort;
    elDirList = $('<div></div>').attr({id : 'webfm-dirlist'}).addClass('narrow');
    elTable = $('<table></table>');
    elTBody = $('<tbody></tbody>');
    elTHead = $('<thead></thead>');
    elTopTr = $('<tr></tr>').attr({id : 'webfm-top-tr'});
    elTd = $('<td></td>').addClass('navi icon');
    elRefresh = $("<a></a>").attr({'href' : '#', title : Webfm.lang.refresh});
    elRefresh.append($('<img />').attr({'src' : getWebfmIconDir() + '/r.gif', alt : Webfm.lang.refresh}));
    elTd.append(elRefresh);
    elTopTr.append(elTd);
    elTd = $('<td></td>').attr({id : 'webfm-bcrumb-td', colspan : '2'}).addClass('navi');
    elSpan = $('<span></span>').attr({id : 'webfm-dirlistbcrumb'});
    obj.breadCrumb = elSpan;
    elTd.append(elSpan);
    elTopTr.append(elTd);
    elTd = $('<td></td>').addClass('ctls-td');
    elSpan = $('<span></span>').attr({id : 'webfm-dirlist-ctls'});
    elCreate = $('<a></a>').attr({href : '#', 'title' : Webfm.lang.directory_create});
    elCreate.append($('<img />').attr({'src' : getWebfmIconDir() + '/dn.gif', alt : Webfm.lang.directory_create}));
    elSpan.append(elCreate);
    elTd.append(elSpan);
    elTopTr.append(elTd);
    elHeadingsTr = $('<tr></tr>');
    var headings = [Webfm.lang.name,Webfm.lang.modified,Webfm.lang.size];
    elTd = $('<td></td>').addClass('head');
    elHeadingsTr.append(elTd);
    for (var x = 0; x < headings.length; x++)
    {
      elTd = $('<td></td>').addClass('head');
      elSort = $('<a></a>').attr({'href' : '#', title : Webfm.lang.sort});
      elSort.append($('<img />').attr({'src' : getWebfmIconDir() + '/down.gif', alt : Webfm.lang.sort}));
      elSort.text(headings[x]);
      elTd.append(elSort);
      elHeadingsTr.append(elTd);
    }
    
    elTHead.append(elTopTr);
    elTHead.append(elHeadingsTr);
    elTable.append(elTHead);
    
    obj.fileContainer = elTBody;

    //Events
    elHeadingsTr.on('click', 'a', obj, obj.ui.handleSortClick);
    elRefresh.on('click', obj, obj.ui.handleRefreshClick);
    elCreate.on('click', obj, obj.ui.handleCreateDirectoryClick);
    obj.breadCrumb.on('click', 'a', obj,obj.ui.handleDirectoryClick);
    obj.fileContainer.on('click', '.dirrow a', obj,obj.ui.handleDirectoryClick);
    if ($('.webfm-browser').length > 0)
    {
      obj.fileContainer.on('click', '.filerow a', obj,obj.ui.handleBrowserFileClick);
    }
    else if (Webfm.data.attachments != null)
    {
      obj.fileContainer.on('click', '.filerow a', obj,obj.ui.handleFileAttachClick);
    }
    else
    {
      obj.fileContainer.on('click', '.filerow a', obj,obj.ui.handleFileClick);
    }
    var directoryItems =
    {
        subdir: {name: Webfm.lang.directory_createsub, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        remdir: {name: Webfm.lang.directory_delete, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        renamedir: {name: Webfm.lang.directory_rename, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        search: {name: Webfm.lang.directory_search, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}}
    }
    $.event.trigger('webfm_build_directory_context',directoryItems);
    //Context Menu
    $.contextMenu({
      selector: '#webfm-dirlist .dirrow',
      items: directoryItems,
    });    
    var fileItems = {
        remfile: {name: Webfm.lang.file_delete, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        renamefile: {name: Webfm.lang.file_rename, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        replacefile: {name: Webfm.lang.file_replace, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        viewfile: {name: Webfm.lang.file_view, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        downloadfile: {name: Webfm.lang.file_download, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}},
        sendlink: {name: Webfm.lang.file_pastelink, callback: function(opt,key) { obj.ui.handleMenuItem(key,opt,obj);}}
    }
    //Context Menu
    $.contextMenu({
      selector: '#webfm-dirlist .filerow',
      items: fileItems,
    });    


    elTable.append(elTBody);
    elDirList.append(elTable);
    Webfm.elements.container.append(elDirList);
    Webfm.loading.hide();
  }
  Webfm.fileManager.ui.prototype.enableDragging = function(obj)
  {
    $('.filerow,.dirrow').draggable({ 
      create: function (event, ui) {
        //Get the screen height and width
        if ($('#mask').length < 1)
        {
          var masker = $('<div></div>').attr({id:'mask'});
          $('body').append(masker);
        }
      },
      
      helper: function(event) { 
        var owidth = $(this).closest('table').css('width');
        var tDiv =$('<div></div>').addClass('drag-container').css({'z-index':'9999'});
        var tTbl = $("<table></table>").css('width',owidth)
          .append($(this).closest('tr').clone());
        tDiv.append(tTbl);
        return tDiv;
      },
      appendTo: "body",
      start: function(event, ui)
      {
        $('#webfm-dirlist .dirrow td').css({'z-index':9999,'position':'relative'});
        $('#webfm-tree .dirtree .folderimg').css({'z-index':9999,'position':'relative'});
        $('#webfm-dirlist .dirrow td a').css({'z-index':9999,'position':'relative',});
        $('#webfm-tree .dirtree .treenode a').css({'z-index':9999,'position':'relative'});
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
        //Set height and width to mask to fill up the whole screen
        $('#mask').css({'width':maskWidth,'height':maskHeight});
         
        //transition effect     
        //$('#mask').fadeIn(200);    
        $('#mask').fadeTo("fast",0.6);  
      },
      stop: function (event, ui)
      {
        $('#mask').hide();
      },
      drag: function (event, ui)
      {
        $('#webfm-dirlist .dirrow,#webfm-tree .treenode div').not('.ui-state-hover').find('.folderimg').attr({'src': getWebfmIconDir() + '/d.gif'});
	$('#webfm-dirlist .dirrow.ui-state-hover .folderimg,#webfm-tree .treenode div.ui-state-hover .folderimg').attr({'src': getWebfmIconDir() + '/open.gif'});
      }
    });
    $('#webfm-dirlist .dirrow,#webfm-tree .treenode div').droppable({
       hoverClass: 'ui-state-hover',
       activeClass: 'ui-state-active',
       tolerance: 'pointer',
       greedy: 'true',
       drop: function (event, ui) {
        $('#webfm-dirlist .dirrow td').css({'z-index':'inherit'});
        $('#webfm-tree .dirtree .folderimg').css({'z-index':'inherit'});
        $('#webfm-dirlist .dirrow td a').css({'z-index':'inherit',});
        $('#webfm-tree .dirtree .treenode a').css({'z-index':'inherit'});
         $('#webfm-dirlist .dirrow,#webfm-tree .treenode div').not('.ui-state-hover').find('.folderimg').attr({'src': getWebfmIconDir() + '/d.gif'});
         obj.ui.handleItemDrop(event,this,ui,obj) 
       },
       over: function (event, ui)
       {
         $(this).effect('highlight', {},600);
       },
    });
  }
  Webfm.fileManager.prototype.setWorkingDirectory = function(path, dir)
  {
    if (arguments.length > 1)
    {
      this.presentWorkingDirectory = dir;
    }
    else
    {
      this.presentWorkingDirectory = this.fileCache.findDir(path);
    }
    this.presentWorkingDirectory.cached = true;
    this.currentDirectoryPath = path;
    this.ui.updateBreadcrumb(this);
    if ($('#webfm-uploader-destination').length > 0)
    {
       $('#webfm-uploader-destination').each(function () { $(this).val(path) });
    }
  }
  Webfm.fileManager.ui.prototype.updateBreadcrumb = function (obj)
  {
    var elSpan = obj.breadCrumb;
    elSpan.text('');
    elSpan.children().remove();
    var fullPath = obj.currentDirectoryPath.split('/');
    fullPath.shift();
    //Todo fix breadcrumb    
    var crumbStr = '';
    for (var x = 0; x < fullPath.length-1;x++)
    {
      crumbStr += '/' + fullPath[x];
      elSpan.append(document.createTextNode(' / '));
      elSpan.append($('<a></a>').attr({'href' : '#', title : crumbStr}).text(fullPath[x]));
    }
    elSpan.append(document.createTextNode(' / '));
    elSpan.append(document.createTextNode(fullPath[fullPath.length-1]));
  }

  Webfm.fileManager.prototype.dataRefreshCallback = function(result, obj)
  {
    obj.fileContainer.children().remove();
    var tDir = obj.fileCache.findDir(result.root.p)
    if (!tDir)
      obj.fileCache.addDirectory(result.root);
    obj.ui.buildDirectoryRows(obj.fileContainer,result.dirs,obj);
    obj.ui.buildFileRows(obj.fileContainer,result.files,obj);
    $.webfm_sort(obj.fileContainer,1);
    obj.setWorkingDirectory(result.root.p);
    obj.ui.enableDragging(obj);
    Webfm.loading.hide();
  }
  Webfm.fileManager.prototype.dataConflictResolutionCallback = function(result,obj,target,fid)
  {
    Webfm.loading.hide();
    if (result.status == 'false')
    {
      if (result.exists == 'true')
      {
        //If we can display visual feedback via vibration of the uploader
        $('#webfm-uploader-form').vibrate();
        Webfm.error.show(Webfm.lang.error,Webfm.lang.conflict_error);
        return;
      }
      Webfm.error.show(Webfm.lang.resource_error,result.err);
    }
    else
    {
      obj.updateCache(result);
      obj.refreshFromCache();
      target.trigger('resolved',fid);
    }
  }
  Webfm.fileManager.prototype.dataUpdateCheckCallback = function(result,obj)
  {
    Webfm.loading.hide();
    var tDir = obj.fileCache.findDir(result.root.p);
    if (tDir)
    {
      if (result.root.m == tDir.modified)
      {
        obj.refreshFromCache();
        return;
      }
    }
    Webfm.dataRequest('readfiles', function(data,ob) { obj.dataRefreshCallback(data,ob); }, obj, result.root.p);
  }

  Webfm.fileManager.prototype.renameCallback = function(result,obj)
  {
    obj.updateCache(result);
    obj.refreshFromCache();
    Webfm.loading.hide();
  }
  Webfm.fileManager.prototype.moveCallback = function(result,obj)
  {
    obj.updateCache(result);
    obj.refreshFromCache();
    Webfm.loading.hide();
  }
  Webfm.fileManager.prototype.deleteCallback = function(result,obj)
  {
    obj.updateCache(result);
    obj.refreshFromCache();
    Webfm.loading.hide();
  }
  Webfm.fileManager.prototype.createDirCallback = function(result,obj)
  {
    obj.updateCache(result);
    obj.refreshFromCache();
    Webfm.loading.hide();
  }


  Webfm.fileManager.prototype.updateCache = function(result)
  {
    var invalidateTrees = false;
    if (result.updates)
    {
      if (result.updates.remove)
      {
        for (var ridx in result.updates.remove)
        {
          var rem_item = result.updates.remove[ridx];
          if (rem_item.f == true)
          {
            this.fileCache.removeFile(rem_item);
          }
          else
          {
            invalidateTrees = true;
            this.fileCache.removeDirectory(rem_item);
          }
        }
      }
      if (result.updates.add)
      {
        for (var aidx in result.updates.add)
        {
          var add_item = result.updates.add[aidx];
          if (add_item.f == true)
          {
            this.fileCache.addFile(add_item);
          }
          else
          {
            invalidateTrees = true;
            this.fileCache.addDirectory(add_item);
          }
        }
      }
      if (result.updates.update)
      {
        for (var uidx in result.updates.update)
        {
          var update_item = result.updates.update[uidx];
          this.fileCache.updateDirectory(update_item);
          invalidateTrees = true;
        }
      }
    }
    if (invalidateTrees)
    {
      Webfm.dataRequest('readtrees', function (data,ob) { Webfm.data.directoryTree.dataCallback(data,ob); }, Webfm.data.directoryTree);
    }
  }
  Webfm.fileManager.prototype.refreshFromCache = function()
  {
    this.fileContainer.children().remove();
    this.ui.buildDirectoryRowsFromCache(this.fileContainer,this.currentDirectoryPath,this.presentWorkingDirectory.directories);
    this.ui.buildFileRowsFromCache(this.fileContainer,this.currentDirectoryPath, this.presentWorkingDirectory.files);
    $.webfm_sort(this.fileContainer,1);
    this.ui.enableDragging(this);
  }
  

  Webfm.fileManager.ui.prototype.requestRename = function(e)
  {
    var obj = e.data[2];
    var elItem = e.data[0];
    var elRenamer = elItem.find('#renamer');
    var elTdContainer = elRenamer.parent();
    var oldName = e.data[1];
    var newName = elRenamer.val();
    elRenamer.remove();
    if (oldName != newName)
    {
      elTdContainer.append($('<img />').attr({'src' : getWebfmIconDir() + '/loader.gif', alt : Webfm.lang.loading}));
      Webfm.dataRequest('renamefile', function(data,ob) { obj.renameCallback(data,ob); }, obj, elItem.attr('title'), newName);
    }
    else
    {
       var elLink = $('<a></a>').attr({'href' : '#', 'title' : elItem.attr('title')}).text(oldName);
       elTdContainer.append(elLink);
    }
  }
  Webfm.fileManager.ui.prototype.requestRenameDirectory = function(e)
  {
    var obj = e.data[2];
    var elItem = e.data[0];
    var elRenamer = elItem.find('#renamer');
    var elTdContainer = elRenamer.parent();
    var oldName = e.data[1];
    var newName = elRenamer.val();
    elRenamer.remove();
    if (oldName != newName)
    {
      elTdContainer.append($('<img />').attr({'src' : getWebfmIconDir() + '/loader.gif', alt : Webfm.lang.loading}));
      Webfm.dataRequest('renamedir', function(data,ob) { obj.renameCallback(data,ob); }, obj, elItem.attr('title'), newName);
    }
    else
    {
       var elLink = $('<a></a>').attr({'href' : '#', 'title' : elItem.attr('title')}).text(oldName);
       elTdContainer.append(elLink);
    }
  }

  Webfm.fileManager.ui.prototype.buildDirectoryRows = function(el,dirs,obj)
  {
    var elTr,elTd, elLink, elIcon;
    for (var didx in dirs)
    {
      obj.fileCache.addDirectory(dirs[didx]);
      elTr = $('<tr></tr>').attr({id : 'webfm-dirlist'+didx, 'title' : dirs[didx].p}).addClass('dirrow');
      elTd = $('<td></td>');
      elIcon = $('<img />').attr({id: 'webfm-dirlist'+didx,'src' : getWebfmIconDir() + '/d.gif', alt : Webfm.lang.directory}).addClass('folderimg');
      elLink = $('<a></a>').attr({'href' : '#', 'title' : dirs[didx].p}).text(dirs[didx].n);
      elTd.append(elIcon);
      elTr.append(elTd);
      elTd = $('<td></td>');
      elTd.append(elLink);
      elTd.attr({'data-webfm-value':dirs[didx].n.toUpperCase()});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.convertunixtime(parseInt(dirs[didx].m, 10)));
      elTd.attr({'data-webfm-value':dirs[didx].m});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text('');
      elTr.append(elTd);
      el.append(elTr);
    }
  }
  Webfm.fileManager.ui.prototype.buildDirectoryRowsFromCache = function(el,dir,dirs)
  {
    var elTr,elTd, elLink, elIcon;
    for (var didx in dirs)
    {
      elTr = $('<tr></tr>').attr({id : 'webfm-dirlist'+didx, 'title' : dir + '/' + dirs[didx].name}).addClass('dirrow');
      elTd = $('<td></td>');
      elIcon = $('<img />').attr({id: 'webfm-dirlist'+didx,'src' : getWebfmIconDir() + '/d.gif', alt : Webfm.lang.directory}).addClass('folderimg');
      elLink = $('<a></a>').attr({'href' : '#', 'title' : dir + '/' + dirs[didx].name}).text(dirs[didx].name);
      elTd.append(elIcon);
      elTr.append(elTd);
      elTd = $('<td></td>');
      elTd.append(elLink);
      elTd.attr({'data-webfm-value':dirs[didx].name.toUpperCase()});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.convertunixtime(parseInt(dirs[didx].modified, 10)));
      elTd.attr({'data-webfm-value':dirs[didx].modified});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text('');
      elTr.append(elTd);
      el.append(elTr);
    }
  }

  Webfm.fileManager.ui.prototype.buildFileRows = function(el,files,obj)
  {
    var elTr,elTd, elLink, elIcon;
    for (var fidx in files)
    {
      obj.fileCache.addFile(files[fidx]);
      elTr = $('<tr></tr>').attr({id : 'webfm-file'+fidx, 'title' : files[fidx].p + '/' + files[fidx].n}).addClass('filerow');
      elTr.attr({'data-fid':files[fidx].id});
      elTd = $('<td></td>');
      if (files[fidx].e && files[fidx].e != "")
        elIcon = $('<img />').attr({'src' : getWebfmIconDir() + '/'+Webfm.icons['e'+files[fidx].e]+'.gif', alt : Webfm.lang.file});
      else
        elIcon = $('<img />').attr({'src' : getWebfmIconDir() + '/f.gif', alt : Webfm.lang.file});
      elLink = $('<a></a>').attr({'href' : '#', 'title' : files[fidx].p + '/' + files[fidx].n}).text(files[fidx].n);
      elLink.attr({'data-fid':files[fidx].id})
      elLink.attr({'data-fsize':files[fidx].s});
      elTd.append(elIcon);
      elTr.append(elTd);
      elTd = $('<td></td>');
      elTd.append(elLink);
      elTd.attr({'data-webfm-value':files[fidx].n.toUpperCase()});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.convertunixtime(parseInt(files[fidx].m, 10)));
      elTd.attr({'data-webfm-value':files[fidx].m});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.size(parseInt(files[fidx].s)));
      elTd.attr({'data-webfm-value':files[fidx].s});
      elTr.append(elTd);
      el.append(elTr);
    }
  }
  Webfm.fileManager.ui.prototype.buildFileRowsFromCache = function(el,dir,files)
  {
    var elTr,elTd, elLink, elIcon;
    for (var fidx in files)
    {
      elTr = $('<tr></tr>').attr({id : 'webfm-file'+fidx, 'title' : dir + '/' + files[fidx].name}).addClass('filerow');
      elTr.attr({'data-fid':files[fidx].fid});
      elTd = $('<td></td>');
      if (files[fidx].ext && files[fidx].ext != "")
        elIcon = $('<img />').attr({'src' : getWebfmIconDir() + '/'+Webfm.icons['e'+files[fidx].ext]+'.gif', alt : Webfm.lang.file});
      else
        elIcon = $('<img />').attr({'src' : getWebfmIconDir() + '/f.gif', alt : Webfm.lang.file});
      elLink = $('<a></a>').attr({'href' : '#', 'title' : dir + '/' + files[fidx].name}).text(files[fidx].name);
      elLink.attr({'data-fid':files[fidx].fid});
      elLink.attr({'data-fsize':files[fidx].size});
      elTd.append(elIcon);
      elTr.append(elTd);
      elTd = $('<td></td>');
      elTd.append(elLink);
      elTd.attr({'data-webfm-value':files[fidx].name.toUpperCase()});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.convertunixtime(parseInt(files[fidx].modified, 10)));
      elTd.attr({'data-webfm-value':files[fidx].modified});
      elTr.append(elTd);
      elTd = $('<td></td>').addClass('txt').text(Webfm.size(parseInt(files[fidx].size)));
      elTd.attr({'data-webfm-value':files[fidx].size});
      elTr.append(elTd);
      el.append(elTr);
    }
  }
  Webfm.fileManager.ui.prototype.initiateRename = function(item,obj)
  {
    var elLink = item.find('a');
    var oldName = elLink.text();
    var elTdContainer = elLink.parent();
    var elRenamer = $("<input/>").attr({'id':'renamer','title':item.attr('title'),'type' :'text'}).css({'width' : '95%'}).val(oldName);
    elLink.remove();
    elTdContainer.append(elRenamer);
    elRenamer.focus(function() { $(this).select();});
    if (item.hasClass('filerow'))
    {
      elRenamer.onEnter(new Array(item, oldName, obj),obj.ui.requestRename);
      elRenamer.blur(new Array(item, oldName, obj),obj.ui.requestRename);
    }
    else
    {
      elRenamer.onEnter(new Array(item, oldName, obj),obj.ui.requestRenameDirectory);
      elRenamer.blur(new Array(item, oldName, obj),obj.ui.requestRenameDirectory);
    }
    elRenamer.focus();  
  }
  Webfm.fileManager.prototype.attachFile = function(fid, filename,filesize)
  {
    var obj = this;
    Webfm.data.attachments.add(fid,filename,filesize);
  }
  Webfm.fileManager.prototype.changeDirectory = function(target)
  {
    var obj = this;
    var tDir = this.fileCache.findDir(target);
    if (tDir && tDir.cached)
    {
      this.setWorkingDirectory(target,tDir);	
      Webfm.dataRequest('updatecheck', function(data,ob) { obj.dataUpdateCheckCallback(data,ob); }, obj, this.currentDirectoryPath);
    }
    else
    {
      Webfm.dataRequest('readfiles', function(data,ob) { obj.dataRefreshCallback(data,ob); }, obj, target);
    }
  }
  Webfm.fileManager.prototype.moveDirectory = function(original,dest)
  {
    var obj = this;
    Webfm.dataRequest('movedir', function(data,ob) { obj.moveCallback(data,ob); }, obj, original, dest);
  }
  Webfm.fileManager.prototype.moveFile = function(original,dest)
  {
    var obj = this;
    Webfm.dataRequest('movefile', function(data,ob) { obj.moveCallback(data,ob); }, obj, original, dest);
  }
  Webfm.fileManager.prototype.deleteFile = function(target)
  {
    var obj = this;
    Webfm.dataRequest('deletefile', function(data,ob) { obj.deleteCallback(data,ob); }, obj, target);
  }
  Webfm.fileManager.prototype.deleteDirectory = function(target)
  {
    var obj = this;
    Webfm.dataRequest('deletedir', function(data,ob) { obj.deleteCallback(data,ob); }, obj, target);
  }
  Webfm.fileManager.prototype.createDirectory = function(target,name)
  {
    var obj = this;
    Webfm.dataRequest('createdir', function(data,ob) { obj.createDirCallback(data,ob); }, obj, target,name);
  }
  Webfm.fileManager.ui.prototype.initiateDownload = function(item,obj)
  {
    $.downloadFile(Drupal.settings.basePath + 'webfm/'+item.data('fid'));
  }
  Webfm.fileManager.ui.prototype.initiateView = function(item,obj)
  {
    $.viewFile(Drupal.settings.basePath + 'webfm/'+item.data('fid')+'/view');
  }
  Webfm.fileManager.ui.prototype.handleItemDrop = function (event, targetObj, ui, obj)
  {
    var target = "";
    if (targetObj.title)
    {
      target = targetObj.title;
    }
    else
    {
      target = $(targetObj).parent().attr('title');
    }
    var source = ui.draggable[0].title;
    if ($(ui.draggable[0]).hasClass('filerow'))
    {
      obj.moveFile(source,target);
    }
    else
    {
      Webfm.confirmation.show('Confirm move',Webfm.lang.confirm_move_directory,'Move',obj.ui.handleConfirmMoveDirectory,[source,target],obj)
    }
  }
  Webfm.fileManager.ui.prototype.handleConfirmMoveDirectory = function(data,obj)
  {
    obj.moveDirectory(data[0],data[1]);
  }
  Webfm.fileManager.ui.prototype.handleConfirmCreateSubDirectory = function(data,input,obj)
  {
    obj.createDirectory(data[0],input);
  }
  Webfm.fileManager.ui.prototype.handleConfirmCreateDirectory = function(data,input,obj)
  {
    obj.createDirectory(obj.currentDirectoryPath,input);
  }
  Webfm.fileManager.ui.prototype.handleConfirmDeleteFile = function(data,obj)
  {
    obj.deleteFile(data[0]);
  }
  Webfm.fileManager.ui.prototype.handleConfirmDeleteDirectory = function(data,obj)
  {
    obj.deleteDirectory(data[0]);
  }
  Webfm.fileManager.ui.prototype.handleRefreshClick = function(event)
  {
    var obj = event.data;
    Webfm.dataRequest('updatecheck', function(data,ob) { obj.dataUpdateCheckCallback(data,ob); }, obj, obj.currentDirectoryPath);
  }
  Webfm.fileManager.ui.prototype.handleConfirmConflictRenameFile = function(data,input,obj)
  {
    var action = data[0];
    var fid = data[1];
    var name = data[2];
    var dest = data[3];
    var target = data[4];
    if (action == 'rename_new')
    {
      Webfm.dataRequest('resolveconflict', function(data,ob) { obj.dataConflictResolutionCallback(data,ob,target,fid); }, obj, fid, dest, input);
    }
    else
    {
      var secondaryAction = function () {
        Webfm.dataRequest('resolveconflict', function(data,ob) { obj.dataConflictResolutionCallback(data,ob,target,fid); }, obj, fid, dest, name);
      } 
      Webfm.dataRequest('renamefile', function(data,ob) { obj.renameCallback(data,ob); secondaryAction(); }, obj, dest + '/' + name, input);
    }
  }

  Webfm.fileManager.ui.prototype.handleConflictClick = function(event,target,fid,name,dest,obj)
  {
    Webfm.error.hide();
    var selected = target.parent().find('.conflict-choice').filter(':checked');
    if (selected.length > 0)
    {
      var action = selected.val();
      if (action)
      {
        switch (action)
        {
          case 'cancel':
            Webfm.dataRequest('cancelupload', function(data,ob) { target.parent().trigger('resolved',fid); }, obj, fid);
            break;
          case 'rename_existing':
             Webfm.confirmation.prompt(Webfm.lang.file_rename,Webfm.lang.conflict_cofirm_rename_existing,Webfm.lang.rename,obj.ui.handleConfirmConflictRenameFile,[action,fid,name,dest,target.parent()],obj)
            break;
          case 'rename_new':
             Webfm.confirmation.prompt(Webfm.lang.file_rename,Webfm.lang.conflict_cofirm_rename_new,Webfm.lang.rename,obj.ui.handleConfirmConflictRenameFile,[action,fid,name,dest,target.parent()],obj)
            break;
          case 'overwrite':      
            Webfm.dataRequest('resolveconflict', function(data,ob) { obj.dataConflictResolutionCallback(data,ob,target.parent(),fid); }, obj, fid, dest, name, 'overwrite');
            break;
        }
      }
    }
  }

  Webfm.fileManager.ui.prototype.handleCreateSubDirectory = function(item,obj)
  {
    var target = item.attr('title');
    Webfm.confirmation.prompt(Webfm.lang.directory_createsub,Webfm.lang.directory_createsub_prompt,Webfm.lang.create,obj.ui.handleConfirmCreateSubDirectory,[target],obj)
  }

  Webfm.fileManager.ui.prototype.handleCreateDirectoryClick = function(event)
  {
    var obj = event.data;
    Webfm.confirmation.prompt(Webfm.lang.directory_create,Webfm.lang.directory_create_prompt,Webfm.lang.create,obj.ui.handleConfirmCreateDirectory,[],obj)
  }

  Webfm.fileManager.ui.prototype.handleDelete = function (item,obj)
  {
    var target = item.attr('title');
    if (item.hasClass('filerow'))
    {
      Webfm.confirmation.show(Webfm.lang.confirm_delete,Webfm.lang.confirm_delete_file,Webfm.lang.delete,obj.ui.handleConfirmDeleteFile,[target],obj);
    }
    else
    {
      Webfm.confirmation.show(Webfm.lang.confirm_delete,Webfm.lang.confirm_delete_directory,Webfm.lang.delete,obj.ui.handleConfirmDeleteDirectory,[target],obj);
    }
  }


  Webfm.fileManager.ui.prototype.handleMenuItem = function(key,opt,obj)
  {
    switch (opt)
    {
      case "viewfile":
	obj.ui.initiateView(key.$trigger,obj);
        break;  
      case "remfile":
        obj.ui.handleDelete(key.$trigger, obj);
        break;  
      case "renamefile":
	obj.ui.initiateRename(key.$trigger,obj);
        break;  
      case "downloadfile":
	obj.ui.initiateDownload(key.$trigger,obj);
        break;  
      case "sendlink":
        break;  
      case "subdir":
        obj.ui.handleCreateSubDirectory(key.$trigger,obj);
        break;  
      case "remdir":
        obj.ui.handleDelete(key.$trigger, obj);
        break;  
      case "renamedir":
	obj.ui.initiateRename(key.$trigger,obj);
        break;  
      case "search":
        break;  

    }
  }
  Webfm.fileManager.ui.prototype.handleSortClick = function(event)
  {
    var obj = event.data;
    var idx = 0;
    var columnIdx = 1;
    var column = $(this).parent();
    $(this).parents('tr').children('td').each(function () { if ($(this).text() == column.text()) { columnIdx = idx; } idx++; } );
    $.webfm_sort(obj.fileContainer,columnIdx);
    event.preventDefault();
    event.stopPropagation();
  }
  Webfm.fileManager.ui.prototype.handleDirectoryClick = function(event)
  {
    var obj = event.data;
    var target = $(this).attr('title');
    obj.changeDirectory(target);
    event.preventDefault();
    event.stopPropagation();
  }  
  Webfm.fileManager.ui.prototype.handleFileClick = function(event)
  {
    var obj = event.data;
    obj.ui.initiateView($(this),obj);
    event.preventDefault();
    event.stopPropagation();
  }
  Webfm.fileManager.ui.prototype.handleFileAttachClick = function(event)
  {
    var obj = event.data;
    obj.attachFile($(this).data('fid'),$(this).text(),$(this).data('fsize'));
    event.preventDefault();
    event.stopPropagation();
  }
  Webfm.fileManager.ui.prototype.handleBrowserFileClick = function(event)
  {
    var obj = event.data;
    window.opener.CKEDITOR.tools.callFunction($.getURLParameter('CKEditorFuncNum'),Drupal.settings.basePath + 'webfm/'+$(this).data('fid'));
    event.preventDefault();
    event.stopPropagation();
    window.close();
  }
  /*************************
  **** Directory Tree ****
  *************************/

  Webfm.dataTree = function()
  {
    var dt = this;
    this.trees = [];
    Webfm.dataRequest('readtrees', function (data,ob) { dt.dataCallback(data,ob); }, this);
  }
  Webfm.dataTree.prototype.dataCallback = function(data,ob)
  {
    if (data.status)
    {
       ob.tree = data.tree;
       Webfm.elements.tree.children().remove();
       for (var t = 0; t < ob.tree.length; t++)
       {
         this.trees[t] = new Webfm.directoryTree(t, ob.tree[t]);
         Webfm.elements.tree.append(this.trees[t].buildTree());
       }
    }
    Webfm.loading.hide();
  }
  Webfm.directoryTree = function(idx, tree)
  {
    this.tree = tree;
    this.treeName = null;
    this.nodeIdx = 0;
    this.treeIdx = idx;
    for (var tName in tree)
    {
      this.treeName = tName;
      break;
    }
  }
  Webfm.directoryTree.prototype.buildTree = function()
  {
    var elDirTree, elTreeName, elRefresh, elExpImg, elColImg, elColLink, elExpLink, elTreeExp, elContainerDiv, elRootList;
    elDirTree = $("<div></div>").attr({id : 'dirtree' + this.treeIdx}).addClass('dirtree');
    elTreeName = $("<span></span>").attr({id : 'dirtree' + this.treeIdx + 'Name'}).text(' ' + this.treeName + ' ');
    elRefresh = $("<a></a>").attr({'href' : '#', title : Webfm.lang.refresh});
    elRefresh.append($('<img />').attr({'src' : getWebfmIconDir() + '/r.gif', alt : Webfm.lang.refresh}));
    elExpImg = $('<img />').attr({'src' : getWebfmIconDir() + '/plus.gif', alt : Webfm.lang.expand});
    elColImg = $('<img />').attr({'src' : getWebfmIconDir() + '/minus.gif', alt : Webfm.lang.collapse});
    elExpLink = $("<a></a>").attr({'href' : '#', title : Webfm.lang.expandtree});
    elColLink = $("<a></a>").attr({'href' : '#', title : Webfm.lang.collapsetree});
    elExpLink.append(elExpImg);
    elColLink.append(elColImg);
    elTreeExp = $("<span></span>").attr({id : 'dirtree' + this.treeIdx + 'exp'});
    elTreeExp.append(elExpLink);
    elTreeExp.append(elColLink);
    elDirTree.append(elRefresh);
    elDirTree.append(elTreeName);
    elDirTree.append(elTreeExp);
    elContainerDiv = $('<div></div>');
    elRootList = $('<ul></ul>').addClass('root-list').css({'display' : 'block'});
    nodes = this.treeNode('', this.tree[this.treeName], true);
    for (var x = 0; x < nodes.length; x++)
    {
      elRootList.append(nodes[x]);
    }
    elDirTree.append(elRootList);
    elDirTree.on('click', 'a', this,this.handleClick);
    return elDirTree;
  }
  Webfm.directoryTree.prototype.treeNode = function(path, tree, root)
  {
    var elLI, elList, elExpDiv, elExpImg, elColImg, elExpLink, elColLink, elDirLink, elDirImg, npath;
    var lidx = 0;
    var listElements = [];
    var hasItems = false;
    for (var tDir in tree)
    {
      if (!root)
      {
        npath = path + '/' + tDir;
        elDirLink = $("<a></a>").attr({'href' : '#', title : npath}).text(tDir);
      }
      else
      {
        npath = tDir;
        elDirLink = $("<a></a>").attr({'href' : '#', title : npath}).text(tDir.substr(1));
      }
      hasItems = objectHasChildren(tree[tDir]);
      elLI = $('<li></li>').attr({id : 'dirtree' + this.treeIdx + 'node' + (this.nodeIdx++), title : npath}).addClass('treenode');
      elExpDiv = $('<div></div>');
      if (root)
      {
        elLI.addClass('treeroot');
      }

      elExpImg = $('<img />').attr({'src' : getWebfmIconDir() + '/plus.gif', alt : Webfm.lang.expand});
      elColImg = $('<img />').attr({'src' : getWebfmIconDir() + '/minus.gif', alt : Webfm.lang.collapse});
      elExpLink = $("<a></a>").attr({'href' : '#', title : Webfm.lang.expand});
      if (!hasItems)
        elExpLink.css({'visibility' : 'hidden'});
      elColLink = $("<a></a>").attr({'href' : '#', title : Webfm.lang.collapse}).css({'display':'none'});
      elExpLink.append(elExpImg);
      elColLink.append(elColImg);
      elExpDiv.append(elExpLink);
      elExpDiv.append(elColLink);



      elDirImg = $('<img />').attr({'src' : getWebfmIconDir() + '/d.gif'}).addClass('folderimg');
      elLI.append(elExpDiv);

      if (hasItems)
      {

 
        elList = $('<ul></ul>').css({display : 'none'});
        nodes = this.treeNode(npath, tree[tDir]);
        for (x = 0; x < nodes.length; x++)
          elList.append(nodes[x]);
        elLI.append(elList);
      }
      elExpDiv.append(elDirImg);
      elExpDiv.append(elDirLink);
      listElements[lidx++] = elLI;
    }
    return listElements;
  }
  Webfm.directoryTree.prototype.expandChildren = function(el)
  {
    el.children('ul').css({'display' : 'block'});
    if (el.children('ul').length)
    {
      el.children('div').children('a').each( function()
      {
        if ($(this).attr('title') == Webfm.lang.expand)
          $(this).css({'display' : 'none'});
        else if ($(this).attr('title') == Webfm.lang.collapse)
          $(this).css({'display' : 'inline'});
      });
    }
  }
  Webfm.directoryTree.prototype.collapseChildren = function(el)
  {
    if (el.children('ul').length)
    {
      el.children('ul').css({'display' : 'none'});
      el.children('div').children('a').each( function()
      {
        if ($(this).attr('title') == Webfm.lang.expand)
          $(this).css({'display' : 'inline'});
        else if ($(this).attr('title') == Webfm.lang.collapse)
          $(this).css({'display' : 'none'});
      });
    }
  }
  Webfm.directoryTree.prototype.expandTree = function(el)
  {
    var ob = this;
    el.find('li').each( function () {
       ob.expandChildren($(this));        
     }
    );
  }
  Webfm.directoryTree.prototype.collapseTree = function(el)
  {
    var ob = this;
    el.find('li').each( function () {
       ob.collapseChildren($(this));        
     }
    );
  }
  Webfm.directoryTree.prototype.handleClick = function(event)
  {
    if ($(this).attr('title') == Webfm.lang.refresh)
    {
      Webfm.dataRequest('readtrees', function (data,ob) { Webfm.data.directoryTree.dataCallback(data,ob); }, Webfm.data.directoryTree);
    }
    else if ($(this).attr('title') == Webfm.lang.expand)
    {
      event.data.expandChildren($(this).closest('li'))
    }
    else if ($(this).attr('title') == Webfm.lang.collapse)
    {
      event.data.collapseChildren($(this).closest('li'))
    }    
    else if ($(this).attr('title') == Webfm.lang.expandtree)
    { 
      event.data.expandTree($(this).closest('.dirtree').find('.root-list'));
    }
    else if ($(this).attr('title') == Webfm.lang.collapsetree)
    {
      event.data.collapseTree($(this).closest('.dirtree').find('.root-list'));
    }
    else
    {
      Webfm.data.fileManager.changeDirectory($(this).attr('title'),Webfm.data.fileManager);
    }
    event.preventDefault();
    event.stopPropagation();
  }



  Webfm.attachments = function(name, max)
  {
    var obj = this;
    this.maxAttachments = max;
    this.inputName = name;
    var reqFids = '';
    var elTable = $('<table></table>').attr({'id':'attachment-data-table'});
    this.attachmentTable = elTable;
    // Find any existing attachments
    $('.webfm-uploader-form').find('input').each(
       function()
       {
         var iname = $(this).attr('name');
         if (iname && iname.indexOf(name) != -1)
         {
           if ($(this).val() && $(this).val() > 0)
           {
             var elTR = obj.makeRow($(this).val()); 
             reqFids += $(this).val() +',';
             elTable.append(elTR);
           }
         }
       }  
    );
    if (reqFids.length > 0)
    {
      Webfm.dataRequest('fileinfo', function(data,ob) { obj.fileDataCallback(data,ob); }, obj, reqFids.substr(0,reqFids.length-1));
    }
    elTable.on('click', '.remove', obj, obj.handleRemoveClick);
    Webfm.elements.attachments.append(elTable);    
  }
  Webfm.attachments.prototype.fileDataCallback = function(data,ob)
  {
    this.attachmentTable.find('tr').each(
     function()
     {
       for(var f in data.files)
       {
         var file = data.files[f];
         if ($(this).data('fid') == file.id)
         {
           $(this).children('.attachment-file-name').text(file.n);
           $(this).children('.attachment-file-size').text(Webfm.size(parseInt(file.s)));

         }
       }
     }
    );

   
  }
  Webfm.attachments.prototype.handleRemoveClick = function(event)
  {
    var obj = event.data;
    obj.remove($(this).data('fid'));
    
  }
  Webfm.attachments.prototype.makeRow = function(fid)
  {
    var elTR = $('<tr></tr>');
    elTR.attr({'data-fid':fid});
    var elRemove = $('<button/>').attr({'type':'button'}).addClass('btn btn-danger remove');
    elRemove.attr({'data-fid':fid});
    var elI = $('<i></i>').addClass('icon-trash icon-white');
    var elSpan = $('<span></span>').text('Remove Attachment');
    elRemove.append(elI);
    elRemove.append(elSpan);
    var showIconText = $(window).width() > 480;
    elRemove.button({
                icons: {primary: 'ui-icon-trash'},
                text: showIconText
            });
    var elTD = $('<td></td>').addClass('attachment-file-name');
    elTR.append(elTD);
    elTD = $('<td></td>').addClass('attachment-file-size');
    elTR.append(elTD);
    elTD = $('<td></td>').addClass('attachment-actions');
    elTD.append(elRemove);
    elTR.append(elTD);
    return elTR;
  }
  Webfm.attachments.prototype.add = function(fid,filename,filesize)
  {
    var curAttachments = this.attachmentTable.find('tr').length;
    if (this.maxAttachments > 0 && curAttachments >= this.maxAttachments)
      return;
    var elTR = this.makeRow(fid);
    elTR.children('.attachment-file-name').text(filename);
    elTR.children('.attachment-file-size').text(Webfm.size(parseInt(filesize)));
    this.attachmentTable.append(elTR);
    var elAttachmentField = $('<input/>').attr({'type':'hidden','name':this.inputName + '[]'}).val(fid);
    $('.webfm-uploader-form').append(elAttachmentField);
  }
  Webfm.attachments.prototype.remove = function(fid)
  {
    this.attachmentTable.find('tr').each( 
     function()
     {
       if ($(this).data('fid') == fid)
       {
         $(this).remove();
       }   
     }
    );
    $('.webfm-uploader-form').find('input').each(
       function()
       {
         var iname = $(this).attr('name');
         if (iname && iname.indexOf(name) != -1)
         {
           if ($(this).val() && $(this).val() == fid)
           {
             $(this).remove();
           }
         }
       }
    );
  }



  Webfm.dataRequest = function(act, callback, passthrough, param0, param1, param2, param3, param4)
  {
    param0 = (typeof param0 == 'undefined') ? null : param0;
    param1 = (typeof param1 == 'undefined') ? null : param1;
    param2 = (typeof param2 == 'undefined') ? null : param2;
    param3 = (typeof param3 == 'undefined') ? null : param3;
    param4 = (typeof param4 == 'undefined') ? null : param4;
    var url = Drupal.settings.basePath + "webfm_js";
    var obj = new Object();
    obj.action = act;
    if (param0 != null)
    {
     obj.param0 = param0;
    }
    if (param1 != null)
    {
     obj.param1 = param1;
    }
    if (param2 != null)
    {
     obj.param2 = param2;
    }
    if (param3 != null)
    {
     obj.param3 = param3;
    }
    if (param4 != null)
    {
     obj.param4 = param4;
    }

    Webfm.loading.show();
    var randomNo = Math.floor(Math.random()*9999999);
    $.ajax({
      type: "POST",
      url: url + '?r=' + randomNo,
      dataType: 'json',
      data: obj,
      cache: false,
      success : function (data) { callback(data,passthrough);},
      error : function(data) {
        Webfm.error.show();
      }
    });

  }

  Webfm.confirmation.show = function(title,msg,action,callback,data,ob)
  {
    if (msg)
    {
      Webfm.elements.confirmation.children().remove();
      Webfm.elements.confirmation.attr({'title':title});
      var elP = $('<p>'+msg+'</p>');
      var elSpan = $('<span></span>')
      .addClass('ui-icon')
      .addClass('ui-icon-alert').css({'float':'left','margin':'0px 7px 20px 0px'});
      elP.prepend(elSpan);
      Webfm.elements.confirmation.append(elP);
    }
    var btns = {};
    btns[action] = function()
    {
      callback(data,ob);
      $(this).dialog('close');
    }
    btns['Cancel'] = function()
    {
      $(this).dialog('close');
    }
    
    Webfm.elements.confirmation.dialog({
      resizable: false,
      height: 200,
      modal: true,
      buttons: btns,
    });
  } 
  Webfm.confirmation.prompt = function(title,msg,action,callback,data,ob,altInput)
  {
    if (msg)
    {
      Webfm.elements.confirmation.children().remove();
      Webfm.elements.confirmation.attr({'title':title});
      var elP = $('<p></p>');
      elP.append(msg);
      var elSpan = $('<span></span>')
      .addClass('ui-icon')
      .addClass('ui-icon-help').css({'float':'left','margin':'0px 7px 20px 0px'});
      elP.prepend(elSpan);
      Webfm.elements.confirmation.append(elP);
      if (altInput)
      {
        altInput.attr({'name':'confirmation-prompt','id':'confirmation-prompt'});
        Webfm.elements.confirmation.append(altInput);
      }
      else
      {
        var elInput = $('<input type="text" name="confirmation-prompt"/>').attr({'id':'confirmation-prompt'});
      }
      Webfm.elements.confirmation.append(elInput);
    }
    var btns = {};
    btns[action] = function()
    {
      callback(data,$('#confirmation-prompt').val(),ob);
      $(this).dialog('close');
    }
    btns['Cancel'] = function()
    {
      $(this).dialog('close');
    }
    
    Webfm.elements.confirmation.dialog({
      resizable: false,
      height: 250,
      modal: true,
      buttons: btns,
    });
  }

  Webfm.error.show = function(title, msg)
  {
    if (title && msg)
    {
      Webfm.elements.error.children().remove();
      Webfm.elements.error.append($('<span></span>').addClass('error-title').text(title));
      Webfm.elements.error.append($('<span></span>').addClass('error-msg').text(msg));
    }
    else if (title)
    {
      Webfm.elements.error.children().remove();
      Webfm.elements.error.append($('<span></span>').addClass('error-title').text(title));
    }
    else if (Webfm.elements.error.children().length <= 0)
    {
      Webfm.elements.error.append($('<span></span>').addClass('error-title').text(Webfm.lang.resource_error));
    }
    Webfm.elements.error.show();
  }
  Webfm.error.hide = function()
  {
    Webfm.elements.error.hide();
  }
  Webfm.loading.show = function(msg)
  {
    if (msg)
    {
      Webfm.elements.loading.children().remove();
      Webfm.elements.loading.append($('<span></span>').addClass('loading-title').text(Webfm.lang.loading));
      Webfm.elements.loading.append($('<span></span>').addClass('loading-msg').text(msg));
    }
    else if (Webfm.elements.loading.children().length <= 0)
    {
      Webfm.elements.loading.append($('<span></span>').addClass('loading-title').text(Webfm.lang.loading));
    }
    Webfm.elements.loading.show();
  }
  Webfm.loading.hide = function()
  {
    Webfm.elements.loading.hide();
  }

  function objectHasChildren(obj)
  {
    var count = 0;
    for (var k in obj) 
      if (obj.hasOwnProperty(k))
      {
//        if (!(obj[k] instanceof Array))
//        {
//          count++;
//        }
//        else
//        {
//          if (obj[k].length > 0)
           count++
//        }
      }
    if (count > 0)
      return true;
    return false;
  }
//Build date stamp
Webfm.convertunixtime = function (unixtime) {
  var c_date, c_min, c_hours, c_day, c_mon, c_year, format;
  // unix date format doesn't have millisec component
  c_date = new Date(unixtime * 1000);

  c_min = c_date.getMinutes();
  c_hours = c_date.getHours();
  c_day = c_date.getDate();
  c_mon = c_date.getMonth() + 1;
  c_year = c_date.getFullYear();

  c_min = Webfm.doubleDigit(c_min);
  c_hours = Webfm.doubleDigit(c_hours);
  c_day = Webfm.doubleDigit(c_day);
  c_mon = Webfm.doubleDigit(c_mon);

  if(c_year > 1999) {
    c_year -= 2000;
  } else {
    c_year -= 1900;
  }
  c_year = Webfm.doubleDigit(c_year);

  // Get day/month order from db variable
  format = 0;
  if(format == 1) {
    return c_day + "/" + c_mon + "/" + c_year + " " + c_hours + ":" + c_min;
  } else {
    return c_mon + "/" + c_day + "/" + c_year + " " + c_hours + ":" + c_min;
  }
};
Webfm.doubleDigit = function (num) {
  return (num < 10) ? "0" + num : num;
};
Webfm.size = function (sz) {
  var size, units;

  size = sz;
  if(size < 1024) {
    units = " B";
  } else {
    size = parseInt(size >> 10, 10);
    if(size < 1024) {
      units = " KB";
    } else {
      size = parseInt(size >> 10, 10);
      if(size < 1024) {
        units = " MB";
      } else {
        size = parseInt(size >> 10, 10);
        if(size < 1024) {
          units = " GB";
        } else {
          size = parseInt(size >> 10, 10);
          units = " TB";
        }
      }
    }
  }
  return size + units;
};
$.webfm = Webfm;
$.downloadFile = function(url){
  if( url ){ 
    $('<form action="'+ url +'" method="GET"></form>')
    .appendTo('body').submit().remove();
  };
};
$.viewFile = function(url){
  if( url ){
    window.open(url); 
  };
};

$.webfm_sort = function(tbody,columnIdx)
{
  var dirIdx = (columnIdx > 2) ? 1 : columnIdx;
 
 
  var dataDirRows = tbody.children('.dirrow');
  var dataFileRows = tbody.children('.filerow');
  $.each(dataDirRows, function (index,row)
  {
    row.sortIdentifier = $(row).children('td').eq(dirIdx).data('webfmValue');
    //row.sortIdentifier = row.children('td').eq(dirIdx).data('webfm-value');
  });
  $.each(dataFileRows, function (index,row)
  {
    //console.log($(row).children('td').eq(columnIdx));
    //console.log($(row).children('td').eq(columnIdx).data('webfm-value'));
    row.sortIdentifier = $(row).children('td').eq(columnIdx).data('webfmValue');
    //row.sortIdentifier = row.children('td').eq(columnIdx).data('webfm-value');
  });

/*
  var dataDirRows = []
  var dataFileRows = []
   tbody.children('.dirrow').each(function (index,row)
  {
    var itm = $(this);
    itm.sortIdentifier = itm.children('td').eq(dirIdx).data('webfm-value');
    dataDirRows.push(itm);
    //row.sortIdentifier = row.children('td').eq(dirIdx).data('webfm-value');
  });
  tbody.children('.filerow').each(function (index,row)
  {
    var itm = $(this);
    console.log(itm);
    //console.log($(row).children('td').eq(columnIdx));
    //console.log($(row).children('td').eq(columnIdx).data('webfm-value'));
    itm.sortIdentifier = itm.children('td').eq(columnIdx).data('webfm-value');
    dataFileRows.push(itm);
    //row.sortIdentifier = row.children('td').eq(columnIdx).data('webfm-value');
    console.log(itm.sortIdentifier);
  });
*/
  dataDirRows.sort(function(alpha,omega)
  {
    return (alpha.sortIdentifier < omega.sortIdentifier) ? -1 : (alpha.sortIdentifier > omega.sortIdentifier) ? 1 : 0; 
  });
  dataFileRows.sort(function(alpha,omega)
  {
    return (alpha.sortIdentifier < omega.sortIdentifier) ? -1 : (alpha.sortIdentifier > omega.sortIdentifier) ? 1 : 0; 
  });
  tbody.empty().append(dataDirRows).append(dataFileRows);;
  /*for (row in dataDirRows)
  {  
    tbody.append(dataDirRows[row]); 
  }
  for (row in dataFileRows)
  {  
    console.log(dataFileRows[row]);
    tbody.append(dataFileRows[row]); 
  }*/
  //tbody.append(dataFileRows);
}



/**
 * Vibrate 1.0
 *
 * Makes an element vibrate
 *
 * Usage: jQuery('#my-annoying-ad').vibrate();
 *
 * @class vibrate
 * @param {Object} conf, custom config-object
 *
 * Copyright (c) 2008 Andreas Lagerkvist (andreaslagerkvist.com)
 * Released under a GNU General Public License v3 (http://creativecommons.org/licenses/by/3.0/)
 */
$.fn.vibrate = function(conf) {
  var config = jQuery.extend({
    speed: 30, 
    duration: 600, 
    frequency: 5000, 
    spread: 5
  }, conf);

  return this.each(function() {
    var t = jQuery(this);
    var oldTop = t.css('top');
    var oldPosition = t.css('position');
    var oldLeft = t.css('left');

    var vibrate = function() {
      var topPos = Math.floor(Math.random() * config.spread) - ((config.spread - 1) / 2);
      var leftPos = Math.floor(Math.random() * config.spread) - ((config.spread - 1) / 2);
      var rotate = Math.floor(Math.random() * config.spread - (config.spread - 1) / 2); // cheers to erik@birdy.nu for the rotation-idea
      t.css({position: 'relative', left: leftPos +'px', top: topPos +'px','-moz-transform': 'rotate(' + rotate + 'deg)','transform': 'rotate(' + rotate + 'deg)', '-o-transform': 'rotate(' + rotate + 'deg)',WebkitTransform: 'rotate(' +rotate +'deg)'});
    };

    var doVibration = function () {
      var vibrationInterval = setInterval(vibrate, config.speed);

      var stopVibration = function() {
        clearInterval(vibrationInterval);
        t.css({position: oldPosition, left: oldLeft +'px', top: oldTop +'px','-moz-transform': 'rotate(0deg)', 'transform': 'rotate(0deg)', '-o-transform': 'rotate(0deg)',WebkitTransform: 'rotate(0deg)'});
      };

      setTimeout(stopVibration, config.duration);
    };
				
    doVibration();
  });
};

$.fn.onEnter = function(passthrough,callback)
{
    this.keyup(function(e)
        {
            if(e.keyCode == 13)
            {
                e.preventDefault();
                if (typeof callback == 'function')
                {
                    e.data = passthrough;
                    callback.apply(this,new Array(e));
                }
            }
        }
    );
    return this;
}
$.getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
})(jQuery);
