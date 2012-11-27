<?php
/**
 * @file
 * WebFM Page Template
 */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print isset($language->language) ? $language->language : 'en'; ?>" xml:lang="<?php print isset($language->language) ? $language->language : 'en'; ?>">
<head>
  <title><?php print t('WebFM Browser'); ?></title>
  <?php
    print drupal_get_html_head();
    print webfm_browser_css();
    print webfm_browser_js();
  ?>
</head>
<body class="webfm-browser">
<?php print $content; ?>
<?php print drupal_get_js('footer'); ?>
</body>
</html>
