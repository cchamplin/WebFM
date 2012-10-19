<?php
/**
* @file
* WebFM Widget/Field for nodes etc
*/

/**
* Implements hook_field_widget_info().
*/
function webfm_field_widget_info()
{
  return array(
    'file_webfm' => array(
      'label' => t('WebFM File Attachment'),
      'field types' => array('file'),
      'behaviors' => array(
        'multiple values' => FIELD_BEHAVIOR_CUSTOM,
        'default value' => FIELD_BEHAVIOR_NONE,
      ),
      'settings' => array(
      ),
    ),
  );
}
/**
* Implements hook_form_FORM_ID_alter().
*/
function webfm_form_field_ui_field_settings_form_alter(&$form,&$form_state,$form_id)
{
  // Remove fields that we don't need or want
  if ($form['#instance']['widget']['type'] == 'file_webfm')
    unset($form['field']['settings']['uri_scheme']);
}

/**
* Implements hook_form_FORM_ID_alter().
*/
function webfm_form_field_ui_field_edit_form_alter(&$form, &$form_state, $form_id) {
  // Remove fields that we don't need or want
  if ($form['#instance']['widget']['type'] == 'file_webfm')
  {
    unset($form['instance']['settings']['file_directory']);
    unset($form['instance']['settings']['description_field']);
    unset($form['instance']['settings']['token_tree']);
    unset($form['field']['settings']['uri_scheme']);
    $form['field']['cardinality']['#title'] = t('Maximum number of attachments');
    $form['field']['cardinality']['#description'] = t('Enter the maximum number of files a user can attach');
  }
}

/**
* Implements hook_field_attach_submit().
*
* @todo Provide documentation for what we are doing here
*/
function webfm_field_attach_submit($entity_type,$entity,&$form,&$form_state)
{
  // Merge default options.
  $options = array(
    'default' => FALSE,
    'deleted' => FALSE,
    'language' => NULL,
  );

  // Determine the list of instances to iterate on.
  list(, , $bundle) = entity_extract_ids($entity_type, $entity);
  $instances = _field_invoke_get_instances($entity_type, $bundle, $options);

  // Iterate through the instances and collect results.
  $return = array();
  foreach ($instances as $instance) {
    // field_info_field() is not available for deleted fields, so use
    // field_info_field_by_id().
    $field = field_info_field_by_id($instance['field_id']);
    $field_name = $field['field_name'];
    if ($field['type'] == 'file')
    {
      $items = array();
      //Determine if we are dealing with a webfm field and take special measures if so
      $available_languages = field_available_languages($entity_type, $field);
      $languages = _field_language_suggestion($available_languages, $options['language'], $field_name);
      foreach ($languages as $langcode) {
        if ($entity->{$field_name}[$langcode] === array())
        {
          $path = array_merge($form['#parents'], array($field_name, $langcode));
          $key_exists = NULL;
          $values = drupal_array_get_nested_value($form_state['values'], $path, $key_exists);
          $webfm_flagged = false;
          foreach ($values as $key => $value_item)
          {
            if (!empty($value_item['webfm_attached']))
            {
              $webfm_flagged = true;
              foreach ($value_item['webfm_attached'] as $fid)
              {
                if ($fid > 0)
                {
                  $items[] = array('fid'=>$fid,'display' => !empty($field['settings']['display_default']),
                  'description' => '');
                }
              }
            }
          }
          if ($webfm_flagged)
            $entity->{$field_name}[$langcode] = $items;
        }
      }
    }
  }
}

/**
* Implements hook_field_widget_form().
*/
function webfm_field_widget_form(&$form,&$form_state,$field,$instance,$langcode,$items,$delta,$element)
{
  $defaults = array(
    'display' => !empty($field['settings']['display_default']),
    'description' => '',
    'file_data_process' => array(),
  );
 $field_state = field_form_get_state($element['#field_parents'], $field['field_name'], $langcode, $form_state);
  if (isset($field_state['items'])) {
    $items = $field_state['items'];
  }
  // Essentially we use the mfw_managed_file type, extended with some enhancements.
  $element_info = element_info('webfm_managed_file');
  $form['#attributes']['class'][] = 'webfm-uploader-form';
  $element += array(
    '#type' => 'webfm_managed_file',
    '#default_value' => (count($items) > 0) ? array('webfm_attached'=>$items) : $defaults,
    '#extended' => TRUE,
    '#value_callback' => 'webfm_field_widget_value',//$element_info['#value_callback'],
    '#process' => array_merge($element_info['#process'], array('webfm_field_widget_primary_process')), 
   // '#attached' => $element_info['#attached'],
  );

  $element['#description'] = theme('file_upload_help', array('description' => $element['#description']));
  $elements = array($element);
  return $elements;
}

/**
* Function for widget processing.
*
* @todo provide documentation for this function
*/
function webfm_field_widget_primary_process($element,&$form_state,$form)
{
  // Make sure we include js
  webfm_js();
  webfm_css();
  $webfm_markup = theme('webfm-documents',array());
  $element['#prefix'] = $webfm_markup;
  $default_attached  = array();
  if (count($element['#value']['webfm_attached']) <= 0)
  {
     $element['webfm_attachments'] = array(
      '#type'=>'hidden',
      '#default_value'=> '',
      '#process' => array('webfm_field_widget_process'),
      );
  }
  else
  {
    foreach ($element['#value']['webfm_attached'] as $file)
    {
     $element['webfm_attachments'][] = array(
      '#type'=>'hidden',
      '#default_value'=> $file['fid'],
      );
    }
  }
  return $element;
}


/**
* Function for widget value.
*/
function webfm_field_widget_value($element, $input = FALSE, &$form_state) {
if ($input) {
    // Checkboxes lose their value when empty.
    // If the display field is present make sure its unchecked value is saved.
    $field = field_widget_field($element, $form_state);
    if (empty($input['display'])) {
      $input['display'] = $field['settings']['display_field'] ? 0 : 1;
    }
  }

  // We depend on the managed file element to handle uploads.
  $return = webfm_managed_file_value($element, $input, $form_state);
  if ($input)
  {
    if (isset($input['webfm_attachments']) && is_array($input['webfm_attachments']) && count($input['webfm_attachments']) > 0)
    {
      foreach ($input['webfm_attachments'] as $fid)
      {
        $return['webfm_attached'][] = intval($fid);
      }
    }
  }
  else
  {
    $return['webfm_attached'] = isset($element['#default_value']['webfm_attached']) ? $element['#default_value']['webfm_attached'] : array();
  }

  $return += array(
    'webfm_attached' => array(),
  );

  return $return;
}

/**
* Function field widget process.
*/
function webfm_field_widget_process($element, &$form_state, $form) {
  $element['#limit_validation_errors'] = array(array_slice($element['#parents'], 0, -1));
  $element['#name'] .= '[]';
  return $element;
}

/**
* Field Widget Settings Form.
*/
function webfm_field_widget_settings_form($field, $instance) {
  $form =array();
  $widget = $instance['widget'];
  $settings = $widget['settings'];

  $webfm_path = drupal_get_path('module', 'webfm_jquery_upload');
  return $form;
}

/**
* Submit handler for field widget.
*/
function webfm_field_widget_submit($form, &$form_state) {
  // During the form rebuild, file_field_widget_form() will create field item
  // widget elements using re-indexed deltas, so clear out $form_state['input']
  // to avoid a mismatch between old and new deltas. The rebuilt elements will
  // have #default_value set appropriately for the current state of the field,
  // so nothing is lost in doing this.
  $parents = array_slice($form_state['triggering_element']['#parents'], 0, -2);
  drupal_array_set_nested_value($form_state['input'], $parents, NULL);

  $button = $form_state['triggering_element'];

  // Go one level up in the form, to the widgets container.
  $element = drupal_array_get_nested_value($form, array_slice($button['#array_parents'], 0, -1));
  $field_name = $element['#field_name'];
  $langcode = $element['#language'];
  $parents = $element['#field_parents'];

  $submitted_values = drupal_array_get_nested_value($form_state['values'], array_slice($button['#array_parents'], 0, -2));
  foreach ($submitted_values as $delta => $submitted_value) {
    if (!$submitted_value['fid']) {
      unset($submitted_values[$delta]);
    }
  }

  // Re-index deltas after removing empty items.
  $submitted_values = array_values($submitted_values);

  // Update form_state values.
  drupal_array_set_nested_value($form_state['values'], array_slice($button['#array_parents'], 0, -2), $submitted_values);

  // Update items.
  $field_state = field_form_get_state($parents, $field_name, $langcode, $form_state);
  $field_state['items'] = $submitted_values;
  field_form_set_state($parents, $field_name, $langcode, $form_state, $field_state);
}
