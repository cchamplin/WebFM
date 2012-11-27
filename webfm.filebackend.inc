<?php
/**
 * @file
 * Webfm Backend
 */
function webfm_register_backend(IWebFM_FileBackend $backend = NULL) {
  static $backends = array();
  if ($backend == NULL) {
    return $backends;
  }
  $backends[] = $backend;
  return;
}
function webfm_set_active_backend($backendname = NULL) {
  static $backend = NULL;
  if ($backendname == NULL) {
    return $backend;
  }
  $backend = webfm_get_backend($backendname);
}
function webfm_get_active_backend() {
  return webfm_set_active_backend();
}
function webfm_get_backend($backendname) {
  $backends = webfm_register_backend();

  foreach ($backends as $b) {
    if ($b->getName() == $backendname) {
      return $b;
    }
  }
  return NULL;
}


interface IWebFM_FileBackend {
  public function getName();
  public function pathExists($path);
  public function buildWebTree($path);
  public function buildFileData($path);
}
