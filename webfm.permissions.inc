<?php
/**
 * @file
 * WebFM permission handlers
 */

/**
 * Function to check permissions when performing an action
 */
function webfm_check_access($action, $data, &$code) {
  $access = NULL;
  // Check if any modules will provide permissions to perform the action
  foreach (module_implements('webfm_check_access') as $module) {
    $access = module_invoke($module, 'webfm_check_access', $action, $data);
    if ($access == TRUE)
      return TRUE;
  }
  // No modules handled the action
  if (is_null($access) || $access === FALSE) {
    if (!user_access('access webfm'))
    {
      return FALSE;
      $code = 'ACCESS_WEBFM';
    }
    switch ($action) {
      case 'renamefile':
        return _webfm_check_access_renamefile($data, $code);
      case 'renamedir':
        return _webfm_check_access_renamedir($data, $code);
      case 'movedir':
        return _webfm_check_access_movedir($data, $code);
      case 'movefile':
        return _webfm_check_access_movefile($data, $code);
      case 'deletefile':
        return _webfm_check_access_deletefile($data, $code);
      case 'deletedir':
        return _webfm_check_access_deletedir($data, $code);
      case 'createdir':
        return _webfm_check_access_createdir($data, $code);
      case 'uploadfile':
        return _webfm_check_access_uploadfile($data, $code);
      case 'resolveconflict':
        return _webfm_check_access_resolveconflict($data, $code);
      case 'overwritefile':
        return _webfm_check_access_overwritefile($data, $code);
      case 'cancelupload':
        return _webfm_check_access_cancelupload($data, $code);
    }
  }
}

function _webfm_check_access_renamefile($data,&$code) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
  {
    $code = 'MODIFY_FILES';
    return FALSE;
  }

  global $user;
  if ($data['file']->uid != $user->uid)
  {
    $code = 'FILE_OWNERSHIP';
    return FALSE;
  }

  return TRUE;
}

function _webfm_check_access_renamedir($data, &$code) {
  if (user_access('modify any webfm directory'))
    return TRUE;
  if (!user_access('modify own webfm directories'))
  {
    $code = 'MODIFY_DIRECTORIES';
    return FALSE;
  }

  if (variable_get('webfm_lock_root',FALSE) && $data['dirparent'] == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  global $user;
  if ($data['dir']->uid != $user->uid)
  {
    $code = 'DIRECTORY_OWNERSHIP_SOURCE';
    return FALSE;
  }

  return TRUE;
}

function _webfm_check_access_movefile($data, &$code) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
  {
    $code = 'MODIFY_FILES';
    return FALSE;
  }
  global $user;
  if (!user_access('access any webfm directory') && $data['dest']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['dest']->uid != $user->uid)
    {
      $code = 'DIRECTORY_OWNERSHIP_DEST';
      return FALSE;
    }
  }
  if ($data['file']->uid != $user->uid)
  {
    $code = 'FILE_OWNERSHIP';
    return FALSE;
  }

  if (variable_get('webfm_lock_root',FALSE) && $data['dest']->path == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }

  return TRUE;
}

function _webfm_check_access_uploadfile($data, &$code) {
  if (!user_access('create webfm file'))
  {
    $code = 'CREATE_FILES';
    return FALSE;
  }
  global $user;
  if (!user_access('access any webfm directory') && $data['dest']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['dest']->uid != $user->uid)
    {
      $code = 'DIRECTORY_OWNERSHIP';
      return FALSE;
    }
  }

  if (variable_get('webfm_lock_root',FALSE) && $data['dest']->path == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  return TRUE;
}

function _webfm_check_access_movedir($data, &$code) {
  if (user_access('modify any webfm directory'))
    return TRUE;
  if (!user_access('modify own webfm directories'))
  {
    $code = 'MODIFY_DIRECTORIES';
    return FALSE;
  }

  global $user;

  if (!user_access('access any webfm directory') && $data['destdir']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['destdir']->uid != $user->uid)
    {
      $code = 'DIRECTORY_OWNERSHIP_DEST';
      return FALSE;
    }
  }

  if ($data['dir']->uid != $user->uid)
  {
    $code = 'DIRECTORY_OWNERSHIP_SOURCE';
    return FALSE;
  }

 if (variable_get('webfm_lock_root',FALSE) && $data['dirparent'] == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  if (variable_get('webfm_lock_root',FALSE) && $data['destdir']->path == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  return TRUE;
}

function _webfm_check_access_deletefile($data, &$code) {
  if (user_access('delete any webfm file'))
    return TRUE;
  if (!user_access('delete own webfm files'))
  {
    $code = 'DELETE_FILES';
    return FALSE;
  }

  global $user;

  if ($data['file']->uid != $user->uid)
  {
    $code = 'FILE_OWNERSHIP';
    return FALSE;
  }

  return TRUE;
}


function _webfm_check_access_deletedir($data, &$code) {
  if (user_access('delete any webfm directory'))
    return TRUE;
  if (!user_access('delete own webfm directories'))
  {
    $code = 'DELETE_DIRECTORIES';
    return FALSE;
  }


  if (variable_get('webfm_lock_root',FALSE) && $data['dirparent'] == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  global $user;

  if ($data['dir']->uid != $user->uid)
  {
    $code = 'DIRECTORY_OWNERSHIP_SOURCE';
    return FALSE;
  }

  return TRUE;
}


function _webfm_check_access_createdir($data, &$code) {
  if (!user_access('create webfm directory'))
  {
    $code = 'CREATE_DIRECTORIES';
    return FALSE;
  }
  global $user;

  if (user_access('access any webfm directory'))
    return TRUE;
  if ($data['destdir']->uid != $user->uid && $data['destdir']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'DIRECTORY_OWNERSHIP_DEST';
    return FALSE;
  }

  if (variable_get('webfm_lock_root',FALSE) && $data['destdir']->path == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  return TRUE;
}

function _webfm_check_access_resolveconflict($data, &$code) {
  if (user_access('modify any webfm file'))
    return TRUE;

  if (!user_access('modify own webfm files'))
  {
    $code = 'MODIFY_FILES';
    return FALSE;
  }

  global $user;
  if (!user_access('access any webfm directory') && $data['destdir']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['dest']->uid != $user->uid)
    {
      $code = 'DIRECTORY_OWNERSHIP';
      return FALSE;
    }
  }

  if (variable_get('webfm_lock_root',FALSE) && $data['destdir']->path == file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
  {
    $code = 'ROOT_LOCK';
    return FALSE;
  }


  return TRUE;
}

function _webfm_check_access_overwritefile($data,&$code) {
  if (user_access('overwrite any webfm file'))
    return TRUE;

  if (!user_access('overwrite own webfm files'))
  {
    $code = 'OVERWRITE_FILES';
    return FALSE;
  }

  global $user;
  if ($data['destfile']->uid != $user->uid)
  {
    $code = 'FILE_OWNERSHIP';
    return FALSE;
  }

  return TRUE;
}


function _webfm_check_access_cancelupload($data, &$code) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
  {
    $code = 'MODIFY_FILES';
    return FALSE;
  }

  global $user;
  if ($data['file']->uid != $user->uid)
  {
    $code = 'FILE_OWNERSHIP';
    return FALSE;
  }

  return TRUE;
}

