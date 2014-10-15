<?php
/**
 * @file
 * WebFM Documents Template
 */

?>
<div class="more-help-link">
  <div class="description">
   Right-click (Opera: Alt+Left) on files or folders opens the context menu.
  </div>
  [<a href="/admin/settings/webfm">settings...</a>]
  [<a href="/admin/help/webfm">more help...</a>]
</div>
<noscript><p class="err">JavaScript must be enabled in order to use webfm!</p></noscript>
<div id="webfm" <?php if (isset($restrict_path)) { echo 'data-restrict-path="'.$restrict_path.'"'; } ?> <?php if (isset($max_attachments)) { echo 'data-max-attachments="' . $max_attachments . '"'; }?>>
</div>
