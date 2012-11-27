<?php
/**
 * @file
 * WebFM permission handlers
 */

/**
 * Function to check permissions when performing an action
 */
function webfm_check_access($action, $data) {
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
      return FALSE;
    switch ($action) {
      case 'renamefile':
        return _webfm_check_access_renamefile($data);
      case 'renamedir':
        return _webfm_check_access_renamedir($data);
      case 'movedir':
        return _webfm_check_access_movedir($data);
      case 'movefile':
        return _webfm_check_access_movefile($data);
      case 'deletefile':
        return _webfm_check_access_deletefile($data);
      case 'deletedir':
        return _webfm_check_access_deletedir($data);
      case 'createdir':
        return _webfm_check_access_createdir($data);
      case 'uploadfile':
        return _webfm_check_access_uploadfile($data);
      case 'resolveconflict':
        return _webfm_check_access_resolveconflict($data);
      case 'overwritefile':
        return _webfm_check_access_overwritefile($data);
      case 'cancelupload':
        return _webfm_check_access_cancelupload($data);
    }
  }
}

function _webfm_check_access_renamefile($data) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
    return FALSE;

  global $user;
  if ($data['file']->uid != $user->uid)
    return FALSE;

  return TRUE;
}

function _webfm_check_access_renamedir($data) {
  if (user_access('modify any webfm directory'))
    return TRUE;
  if (!user_access('modify own webfm directories'))
    return FALSE;

  global $user;
  if ($data['dir']->uid != $user->uid)
    return FALSE;

  return TRUE;
}

function _webfm_check_access_movefile($data) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
    return FALSE;

  global $user;
  if (!user_access('access any webfm directory') && $data['dest']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['dest']->uid != $user->uid)
      return FALSE;
  }
  if ($data['file']->uid != $user->uid)
    return FALSE;

  return TRUE;
}

function _webfm_check_access_uploadfile($data) {
  if (!user_access('create webfm file'))
    return FALSE;
  global $user;
  if (!user_access('access any webfm directory') && $data['dest']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['dest']->uid != $user->uid)
      return FALSE;
  }
  return TRUE;
}

function _webfm_check_access_movedir($data) {
  if (user_access('modify any webfm directory'))
    return TRUE;
  if (!user_access('modify own webfm directories'))
    return FALSE;

  global $user;

  if (!user_access('access any webfm directory') && $data['destdir']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE")) {
    if ($data['destdir']->uid != $user->uid)
      return FALSE;
  }

  if ($data['dir']->uid != $user->uid)
    return FALSE;

  return TRUE;
}

function _webfm_check_access_deletefile($data) {
  if (user_access('delete any webfm file'))
    return TRUE;
  if (!user_access('delete own webfm files'))
    return FALSE;

  global $user;

  if ($data['file']->uid != $user->uid)
    return FALSE;

  return TRUE;
}


function _webfm_check_access_deletedir($data) {
  if (user_access('delete any webfm directory'))
    return TRUE;
  if (!user_access('delete own webfm directories'))
    return FALSE;

  global $user;

  if ($data['dir']->uid != $user->uid)
    return FALSE;

  return TRUE;
}


function _webfm_check_access_createdir($data) {
  if (!user_access('create webfm directory'))
    return FALSE;

  global $user;

  if (user_access('access any webfm directory'))
    return TRUE;
  if ($data['destdir']->uid != $user->uid && $data['destdir']->path != file_default_scheme() . '://' . variable_get('webfm_root', "SITE"))
    return FALSE;

  return TRUE;
}

function _webfm_check_access_resolveconflict($data) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
    return FALSE;

  return TRUE;
}

function _webfm_check_access_overwritefile($data) {
  if (user_access('overwrite any webfm file'))
    return TRUE;
  if (!user_access('overwrite own webfm files'))
    return FALSE;

  global $user;
  if ($data['destfile']->uid != $user->uid)
    return FALSE;

  return TRUE;
}


function _webfm_check_access_cancelupload($data) {
  if (user_access('modify any webfm file'))
    return TRUE;
  if (!user_access('modify own webfm files'))
    return FALSE;

  global $user;
  if ($data['file']->uid != $user->uid)
    return FALSE;

  return TRUE;
}

