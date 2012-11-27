<?php
/**
 * @file
 * WebFM AJAX Action Handlers
 */

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for file rename action
 *
 * Param0: Full path to source file prefixes with a slash
 * Param1: New filename
 */
function webfm_ajax_renamefile($params, &$response) {
  // @todo Standarize path handling and sanitation
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);

  if (!webfm_is_valid_path($params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_trim(webfm_utf8_urldecode($params[1]));
  if (!webfm_is_valid_filename($params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }

  $extensions = variable_get('webfm_file_extensions', 'jpg jpeg gif png txt doc xls pdf ppt pps odt ods odp');
  $extension_errors = webfm_file_validate_extensions($params[1], $extensions);
  if (count($extension_errors) > 0) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid file extension, valid extenions are: ' . $extensions);
    return;
  }

  $filepieces = explode("/", $params[0]);
  $filename = array_pop($filepieces);
  $newname = file_munge_filename($params[1]);
  $filepath = implode("/", $filepieces);
  $query = new EntityFieldQuery();

  // Grab the current managed file entity
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $params[0], '=');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $file = file_load($file_ids[0]);

  // Ensure user access
  if (!webfm_check_access('renamefile', array('file' => $file, 'fpath' => $filepath))) {
    _access_denied_response($response);
    return;
  }

  // Compose the destination
  $dest = file_default_scheme() . '://' . $filepath . '/' . $newname;

  // Verify we are not overwriting a file, and attempt to move
  if (file_exists($dest) || !$file || !file_move($file, $dest, FILE_EXISTS_ERROR)) {
    $response['status'] = 'false';
    $response['err'] = t('Could not rename file, does a file already exist by that name?');
    return;
  }

  // Because of the issue reported here http://drupal.org/node/1415858
  // We have to resave the entity, so it's curerntly getting saved twice
  $file->filename = $newname;
  $file->uri = $dest;
  file_save($file);

  // @todo Standarize return data into some kind of function
  $dir_modtime = filemtime(file_default_scheme() . '://' . $filepath);
  $response['updates'] =
    array(
      'remove' => array(
        array(
          'f' => 'true',
          'p' => '/' . $filepath,
          'n' => $filename,
        )
      ),
      'add' => array(
        webfm_getFileDataExt($file, '/' . $filepath),
      ),
      'update' => array(
        array(
           'p' => '/' . $filepath,
           'm' => $dir_modtime,
      ),
    )
  );
}

function webfm_is_valid_path($path, $check_root = TRUE) {
  if (preg_match('/\.\./', $path))
    return FALSE;
  if ($path[0] == '/' || $path[0] == '\\')
    return FALSE;

  $path = drupal_str_replace('\\', '/', $path);

  if ($check_root) {
    foreach (module_implements('webfm_check_valid_path') as $module) {
      $valid =  module_invoke($module, 'webfm_check_valid_path', $path);
      if ($valid == TRUE)
        return TRUE;
    }

    if (drupal_strpos($path, variable_get('webfm_root', "SITE")) !== 0)
      return FALSE;
  }
  return FALSE;
}

function webfm_is_valid_directory($filename) {
  // No slashes are valid in directory name
  if (preg_match('/[\\\\\\/]+/', $filename)) {
    return FALSE;
  }
  return TRUE;
}

function webfm_is_valid_filename($filename, $extensions = '') {
  // No slashes are valid in filename
  if (preg_match('/[\\\\\\/]+/', $filename)) {
    return FALSE;
  }
  return TRUE;
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for directory rename action
 *
 * Param0: Source directory
 * Param1: Destination name for directory
 */
function webfm_ajax_renamedir($params, &$response) {
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0]) || $params[0] == variable_get('webfm_root', "SITE")) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_trim(webfm_utf8_urldecode($params[1]));
  if (!webfm_is_valid_directory($params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  if (!is_dir(file_default_scheme() . '://' . $params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Directory does not exist');
    return;
  }

  $dirpieces = explode("/", $params[0]);
  $dirname = array_pop($dirpieces);
  $dirpath = implode("/", $dirpieces);
  $dirstringlen = drupal_strlen(file_default_scheme() . '://' . $params[0]);


  if (file_exists(file_default_scheme() . '://' . $dirpath . '/' . $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Destination already exists');
    return;
  }
  // Grab directory informaton
  $result = db_query('SELECT did, path, uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' => file_default_scheme() . '://' . $params[0]));
  $record = $result->fetchObject();
  if (!webfm_check_access('renamedir', array('dir' => $record))) {
    _access_denied_response($response);
    return;
  }

  $query = new EntityFieldQuery();
  //Get all the files under that directory
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $params[0] . '/%', 'LIKE');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  if (!rename(file_default_scheme() . '://' . $params[0], file_default_scheme() . '://' . $dirpath . '/' . $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Unable to rename directory');
    return;
  }
  $fields = array('path' => file_default_scheme() . '://' . $dirpath . '/' . $params[1]);
  db_update('webfm_dir')->fields($fields)->condition('did', $record->did, '=')->execute();
  // Change the file location
  // and update the entities
  foreach ($file_ids as $fid) {
    $file = file_load($fid);
    $dest = file_default_scheme() . '://' . $dirpath . '/' . $params[1];
    $file->uri = $dest . drupal_substr($file->uri, $dirstringlen);
    file_save($file);
  }
  // Return the modification time of the related directories
  $dir_modtime = filemtime(file_default_scheme() . '://' . $dirpath . '/' . $params[1]);
  $dir_parentmodtime = filemtime(file_default_scheme() . '://' . $dirpath);
  $response['updates'] =
    array(
      'update' => array(
        array(
          'p' => '/' . $params[0],
          'nn' => $params[1],
          'm' => $dir_modtime,
        ),
        array(
          'p' => '/' . $dirpath,
          'm' => $dir_parentmodtime,
        ),
      )
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for file move action
 *
 * Param0: Path to original file
 * Param1: Destination directory
 */
function webfm_ajax_movefile($params, &$response) {

  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[1])), 1);
  if (!webfm_is_valid_path($params[1]) || !is_dir(file_default_scheme() . '://' . $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $originalpath = $params[0];
  $filepieces = explode("/", $params[0]);
  $filename = file_munge_filename(array_pop($filepieces));
  if (!webfm_is_valid_filename($filename)) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid filename');
    return;
  }
  $filepath = implode("/", $filepieces);
  $destpath = $params[1];

  $query = new EntityFieldQuery();
  // Grab the original file entity
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $originalpath, '=');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $file = file_load($file_ids[0]);

  $dest = file_default_scheme() . '://' . $destpath . '/' . $filename;

  // Get the directory record
  $result = db_query('SELECT did, path, uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' =>  file_default_scheme() . '://' . $destpath));
  $record = $result->fetchObject();

  // Check permissions
  if (!webfm_check_access('movefile', array('file' => $file, 'fpath' => $filepath, 'dest' => $record))) {
    _access_denied_response($response);
    return;
  }

  if (file_exists($dest) || !$file || !file_move($file, $dest, FILE_EXISTS_ERROR)) {
    $response['status'] = 'false';
    $response['err'] = t('Could not move file, does a file already exist by that name?');
    return;
  }
  // @todo Do we need to perform this save?
  $file->uri = $dest;
  file_save($file);
  // Prepare response
  $dir_modtime = filemtime(file_default_scheme() . '://' . $filepath);
  $dir_destModTime = filemtime(file_default_scheme() . '://' . $destpath);
  $response['updates'] =
    array(
      'remove' => array(
        array(
          'f' => 'true',
          'p' => '/' . $filepath,
          'n' => $filename,
        )
      ),
      'add' => array(
        webfm_getFileDataExt($file, '/' . $destpath),
      ),
      'update' => array(
        array(
          'p' => '/' . $filepath,
          'm' => $dir_modtime,
        ),
        array(
          'p' => '/' . $destpath,
          'm' => $dir_destModTime,
        ),
      ),
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for directory move action
 *
 * Param0: Source directory
 * Param1: Destination path for directory
 */
function webfm_ajax_movedir($params, &$response) {

  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0]) || $params[0] == variable_get('webfm_root', "SITE")) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[1])), 1);
  if (!webfm_is_valid_path($params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  // Verify that the origin and destination exist
  if (!is_dir(file_default_scheme() . '://' . $params[0]) || !is_dir(file_default_scheme() . '://' . $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Directory does not exist');
    return;
  }
  $originpath = $params[0];
  $dirpieces = explode("/", $originpath);
  $dirname = array_pop($dirpieces);
  $dirpath = implode("/", $dirpieces);
  $dirstringlen = drupal_strlen(file_default_scheme() . '://' . $originpath);
  $destpath = $params[1] . '/' . $dirname;
  $destparentpath = $params[1];

  if (file_exists(file_default_scheme() . '://' . $destpath)) {
    $response['status'] = 'false';
    $response['err'] = t('Destination already exists');
    return;
  }

  // Get directory information for source and destination
  $dir_result = db_query('SELECT did, path ,uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' =>  file_default_scheme() . '://' . $originpath));
  $dir_record = $dir_result->fetchObject();
  $dest_result = db_query('SELECT did, path, uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' =>  file_default_scheme() . '://' . $destparentpath));
  $dest_record = $dest_result->fetchObject();
  if (!webfm_check_access('movedir', array('dir' => $dir_record, 'destdir' => $dest_record))) {
    _access_denied_response($response);
    return;
  }
  // Get the file information for source
  $query = new EntityFieldQuery();
  //Get all the files under that directory
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $originpath . '/%', 'LIKE');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  if (!rename(file_default_scheme() . '://' . $originpath, file_default_scheme() . '://' . $destpath)) {
    $response['status'] = 'false';
    $response['err'] = t('Unable to move directory');
    return;
  }

  $fields = array('path' => file_default_scheme() . '://' . $destpath);
  db_update('webfm_dir')->fields($fields)->condition('did', $dir_record->did, '=')->execute();

  // Update all file entities to point to new path
  foreach ($file_ids as $fid) {
    $file = file_load($fid);
    $dest = file_default_scheme() . '://' . $destpath;
    $file->uri = $dest . drupal_substr($file->uri, $dirstringlen);
    file_save($file);
  }
  $dir_modtime = filemtime(file_default_scheme() . '://' . $destpath);
  $dir_parentmodtime = filemtime(file_default_scheme() . '://' . $dirpath);
  $dir_destparentmodtime = filemtime(file_default_scheme() . '://' . $destparentpath);
  $response['updates'] =
    array(
      'update' => array(
        array(
           'p' => '/' . $originpath,
           'mv' => '/' . $destpath,
           'm' => $dir_modtime,
        ),
        array(
           'p' => '/' . $dirpath,
           'm' => $dir_parentmodtime,
        ),
        array(
           'p' => '/' . $destparentpath,
           'm' => $dir_destparentmodtime,
        ),
      )
    );
}


/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for file deletion action
 *
 * Param0: Path to file
 */
function webfm_ajax_deletefile($params, &$response) {
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $originalpath = $params[0];
  $filepieces = explode("/", $params[0]);
  $filename = array_pop($filepieces);
  $filepath = implode("/", $filepieces);

  // Attempt to grab file information
  $query = new EntityFieldQuery();
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $originalpath, '=');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $file = file_load($file_ids[0]);
  if (!webfm_check_access('deletefile', array('file' => $file, 'fpath' => $filepath))) {
    _access_denied_response($response);
    return;
  }

  if (!$file || !file_delete($file, TRUE)) {
    $response['status'] = 'false';
    $response['err'] = t('Could not delete file');
    return;
  }

  $dir_modtime = filemtime(file_default_scheme() . '://' . $filepath);
  $response['updates'] =
    array(
      'remove' => array(
        array(
          'f' => 'true',
          'p' => '/' . $filepath,
          'n' => $filename,
        )
      ),
      'update' => array(
        array(
           'p' => '/' . $filepath,
           'm' => $dir_modtime,
        ),
      )
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for directory deletion action
 *
 * Param0: Path to directory
 */
function webfm_ajax_deletedir($params, &$response) {
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0]) || $params[0] == variable_get('webfm_root', "SITE")) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  if (!is_dir(file_default_scheme() . '://' . $params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Directory does not exist');
    return;
  }
  $originpath = $params[0];
  $dirpieces = explode("/", $originpath);
  $dirname = array_pop($dirpieces);
  $dirpath = implode("/", $dirpieces);

  // Load directory details
  $result = db_query('SELECT did, path, uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' =>  file_default_scheme() . '://' . $originpath));
  $record = $result->fetchObject();
  if (!webfm_check_access('deletedir', array('dir' => $record))) {
    _access_denied_response($response);
    return;
  }

  $query = new EntityFieldQuery();
  //Get all the files under that directory
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $originpath . '/%', 'LIKE');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  foreach ($file_ids as $fid) {
    $file = file_load($fid);
    file_delete($file, TRUE);
  }
  if (!drupal_rmdir(file_default_scheme() . '://' . $originpath)) {
    $response['status'] = 'false';
    $response['err'] = t('Unable to completely remove directory');
    return;
  }
  db_delete('webfm_dir')->condition('did', $record->did, '=')->execute();
  module_invoke_all('webfm_delete_directory', $record);

  $dir_parentmodtime = filemtime(file_default_scheme() . '://' . $dirpath);
  $response['updates'] =
    array(
      'remove' => array(
        array(
          'f' => 'false',
          'p' => '/' . $originpath,
        )
      ),
      'update' => array(
        array(
           'p' => '/' . $dirpath,
           'm' => $dir_parentmodtime,
        ),
      )
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for search action
 *
 * @todo Implement search
 * Param0: Path to directory to search under
 * Param1: Query string
 */
function webfm_ajax_search($params, &$response) {
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_trim(webfm_utf8_urldecode($params[1]));
  if (preg_match('/\.\./', $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid query');
    return;
  }
  if (!is_dir(file_default_scheme() . '://' . $params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Directory does not exist');
    return;
  }
  $originpath = $params[0];
  $searchquery = $params[1];
  $query = new EntityFieldQuery();
  //Get all the files under that directory
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', file_default_scheme() . '://' . $originpath . '/%' . $searchquery . '%', 'LIKE');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $response['dataset'] =
    array(
      'results' => array(),
    );
  foreach ($file_ids as $fid) {
    $file = file_load($fid);
    $fpath = explode('/', file_uri_target($file->uri));
    $fpath = array_pop($fpath);
    $response['dataset']['results'][] = webfm_getFileData($file, '/' . $fpath);
  }
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for directory creation action
 *
 * Param0: Path to directory to create under
 * Param1: Directory name
 */
function webfm_ajax_createdir($params, &$response) {
  $params[0] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[0])), 1);
  if (!webfm_is_valid_path($params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[1] = drupal_trim(webfm_utf8_urldecode($params[1]));
  if (!webfm_is_valid_directory($params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  if (!is_dir(file_default_scheme() . '://' . $params[0])) {
    $response['status'] = 'false';
    $response['err'] = t('Target directory does not exist');
    return;
  }
  if (file_exists(file_default_scheme() . '://' . $params[0] . '/' . $params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Directory already exists');
    return;
  }
  $dirpath = $params[0];
  $dirdest = $params[0] . '/' . $params[1];
  $dirprepareddest = file_default_scheme() . '://' . $dirdest;

  // Grab directory information
  $result = db_query('SELECT did, path, uid FROM {webfm_dir} d WHERE d.path = :root', array(':root' =>  file_default_scheme() . '://' . $dirpath));
  $record = $result->fetchObject();
  if (!webfm_check_access('createdir', array('destdir' => $record))) {
    _access_denied_response($response);
    return;
  }

  if (!file_prepare_directory($dirprepareddest, FILE_CREATE_DIRECTORY)) {
    $response['status'] = 'false';
    $response['err'] = t('Failed to create directory');
    return;
  }
  global $user;
  $fields = array('uid' => $user->uid, 'path' => $dirdrepareddest);
  $new_did = db_insert('webfm_dir')->fields($fields)->execute();
  module_invoke_all('webfm_create_directory', $new_did);

  $dir_parentmodtime = filemtime(file_default_scheme() . '://' . $dirpath);
  $dir_modtime = filemtime($dirdrepareddest);
  $response['updates'] =
    array(
      'add' => array(
        array('n' => $params[1],
              'p' => '/' . $dirdest,
              'm' => $dir_modtime),
      ),
      'update' => array(
        array(
           'p' => '/' . $dirpath,
           'm' => $dir_parentmodtime,
        ),
      ),
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for conflict resolution action
 *
 * Param0: File ID
 * Param1: Directory for file upload destination
 * Param2: Upload Filename
 */
function webfm_ajax_resolveconflict($params, &$response) {
  $params[0] = intval($params[0]);
  if ($params[0] <= 0) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid file id');
  }
  $params[1] = drupal_substr(drupal_trim(webfm_utf8_urldecode($params[1])), 1);
  if (!webfm_is_valid_path($params[1])) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  $params[2] = drupal_trim(webfm_utf8_urldecode($params[2]));

  $extensions = variable_get('webfm_file_extensions', 'jpg jpeg gif png txt doc xls pdf ppt pps odt ods odp');
  $extension_errors = webfm_file_validate_extensions($params[2], $extensions);
  if (count($extension_errors) > 0) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid file extension, valid extenions are: ' . $extensions);
    return;
  }


  $filename = file_munge_filename($params[2]);


  if (!webfm_is_valid_filename($filename)) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid path');
    return;
  }
  if ($params[3] == 'overwrite') {
    $overwrite = FILE_EXISTS_REPLACE;
  }
  else {
    $overwrite = FILE_EXISTS_ERROR;
  }

  $filepath = $params[1];
  //Load the file record by id
  $query = new EntityFieldQuery();
  // Attempt the load the file record
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('fid', $params[0], '=');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $file = file_load($file_ids[0]);
  $dest = file_default_scheme() . '://' . $filepath . '/' . $filename;
  if (!webfm_check_access('resolveconflict', array('file' => $file, 'fpath' => $filepath))) {
    _access_denied_response($response);
    return;
  }
  $pfile = NULL;
  if ($overwrite == FILE_EXISTS_REPLACE) {
    $pquery = new EntityFieldQuery();
    $pquery->entityCondition('entity_type', 'file')
    ->propertyCondition('uri', $dest, '=');
    $pret_ids = $pquery->execute();
    $pfile_ids = array_keys($pret_ids['file']);
    $pfile = file_load($pfile_ids[0]);
    if (!webfm_check_access('overwritefile', array('file' => $file, 'destfile' => $pfile))) {
      _access_denied_response($response);
      return;
    }
  }
  if (($overwrite != FILE_EXISTS_REPLACE && file_exists($dest)) || !$file || !file_move($file, $dest, $overwrite)) {
    $response['status'] = 'false';
    $response['exists'] = 'true';
    $response['err'] = t('Could not rename file, does a file already exist by that name?');
    return;
  }
  if (!$pfile) {
    $file->filename = $filename;
    $file->uri = $dest;
    file_save($file);
  }
  else {
    global $user;
    $pfile->uid = $user->uid;
    file_save($pfile);
    db_delete('file_managed')->condition('fid', $file->fid)->execute();
    db_delete('file_usage')->condition('fid', $file->fid)->execute();
    $file = $pfile;
  }
  $dir_modtime = filemtime(file_default_scheme() . '://' . $filepath);
  $response['updates'] =
    array(
      'remove' => array(
        array(
          'f' => 'true',
          'p' => '/' . $filepath,
          'n' => $filename,
        )
      ),
      'add' => array(
        webfm_getFileDataExt($file, '/' . $filepath),
      ),
      'update' => array(
        array(
           'p' => '/' . $filepath,
           'm' => $dir_modtime,
        ),
      )
    );
}

/**
 * Implements hook_webfm_ajax_ACTION().
 * Handle for file cancel upload
 *
 * Param0: File ID
 */
function webfm_ajax_cancelupload($params, &$response) {

  $params[0] = intval($params[0]);
  if ($params[0] <= 0) {
    $response['status'] = 'false';
    $response['err'] = t('Invalid file id');
  }
  //Load the file record by id
  $query = new EntityFieldQuery();
  $query->entityCondition('entity_type', 'file')
    ->propertyCondition('fid', $params[0], '=');
  $ret_ids = $query->execute();
  $file_ids = array_keys($ret_ids['file']);
  $file = file_load($file_ids[0]);
  if (!webfm_check_access('cancelupload', array('file' => $file))) {
    _access_denied_response($response);
    return;
  }
  file_delete($file, TRUE);
}

function _access_denied_response(&$response) {
  $response['status'] = 'false';
  $response['err'] = t('Access Denied');
}
