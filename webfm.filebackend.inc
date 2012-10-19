<?php
function webfm_register_backend(IWebFM_FileBackend $backend = null)
{
  static $backends = array();
  if ($backend == null)
  {
   return $backends;
  }
  $backends[] = $backend;
  return;
}
function webfm_set_active_backend($backendName = null)
{
  static $backend = null;
  if ($backendName == null)
  {
    return $backend;
  }
  $backend = webfm_get_backend($backendName);
}
function webfm_get_active_backend()
{
  return webfm_set_active_backend();
}
function webfm_get_backend($backendName)
{
  $backends = webfm_register_backend();

  foreach ($backends as $b)
  {
    if ($b->getName() == $backendName)
    {
     return $b;
    }
  }
  return null;
}


interface IWebFM_FileBackend
{
  public function getName();
  public function pathExists($path);
  public function buildWebTree($path);
  public function buildFileData($path);
}
