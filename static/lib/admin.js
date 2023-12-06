"use strict";

import * as alerts from "alerts";

export function init() {
  $(`#oss-region option[value="${ajaxify.data.region}"]`).prop("selected", true);

  $("#oss-upload-bucket").on("submit", function (e) {
    e.preventDefault();
    save("osssettings", this);
  });

  $("#oss-upload-credentials").on("submit", function (e) {
    e.preventDefault();
    var form = this;
    bootbox.confirm(
      "Are you sure you wish to store your credentials for accessing AliOSS in the database?",
      function (confirm) {
        if (confirm) {
          save("credentials", form);
        }
      }
    );
  });

  function save(type, form) {
    var data = {
      _csrf: config.csrf_token,
    };

    var values = $(form).serializeArray();
    for (var i = 0, l = values.length; i < l; i++) {
      data[values[i].name] = values[i].value;
    }

    $.post(`/api/admin/plugins/alioss-uploads/${type}`, data)
      .done(function (response) {
        if (response) {
          ajaxify.refresh();
          alerts.success(response);
        }
      })
      .fail(function (jqXHR) {
        ajaxify.refresh();
        alerts.error(jqXHR.responseJSON ? jqXHR.responseJSON.error : "Error saving!");
      });
  }
}
