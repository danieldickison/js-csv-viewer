if (!('history' in window) ||
    !window.history.replaceState ||
    !Array.prototype.map ||
    !('FileReader' in window)) {
    alert('This browser is not supported');
}

$('#input-form').submit(function () {
    var text = $(this).find('.csv').val(),
        url = $(this).find('.url').val();
    if (text) {
        renderCSVString(text);
    }
    else if (url) {
        history.replaceState(null, null, '?url=' + url);
        renderFromURL(url);
    }
    return false;
})
.find('.url').on('change', function () {
    $('#input-form .csv').val('');
});

$('body')
.on('dragenter dragover', function (e) {
    var type = e.originalEvent.dataTransfer.types[0];
    if (type && type === 'Files') {
        showMessage('Drop file to display');
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        return false;
    }
    else {
        return true;
    }
})
.on('dragexit', function (e) {
    showMessage(false);
})
.on('drop', function (e) {
    var file = e.originalEvent.dataTransfer.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function () {
            var text = reader.result;
            $('#input-form .csv').val(text);
            renderCSVString(text);
            showMessage(false);
        };
        showMessage('Reading file…')
        reader.readAsText(file);
        return false;
    }
    else {
        return true;
    }
});

function showMessage(msg) {
    if (msg) {
        $('#mask').fadeIn('fast').find('.message').text(msg);
    }
    else {
        $('#mask').fadeOut();
    }
}

function renderFromURL(url) {
    $.ajax({
        url: '/remote-csv',
        data: {
            url: url
        },
        dataType: 'text'
    })
    .done(function (data) {
        $('#input-form .csv').val(data);
        renderCSVString(data);
    })
    .fail(function () {
        alert('failed');
    });
}

function renderCSVString(str) {
    var data = CSVToArray(str),
        headerRow = data.shift(),
        columns = headerRow.map(function (header, i) {
            header = header || '';
            return {name: header, field: i, id: header};
        });
    slickgrid.setColumns(columns);
    slickgrid.setData(data);
    slickgrid.updateRowCount();
    slickgrid.render();
}

function resizeGridHeight() {
    var windowHeight = $(window).height(),
        inputPanelHeight = $('#input-form').outerHeight();
    $('#grid').height(windowHeight - inputPanelHeight);
}

var options = {
        enableCellNavigation: true,
        enableColumnReorder: true,
        leaveSpaceForNewRows: false
    },
    slickgrid = new Slick.Grid('#grid', [], [], options);

$(document).ready(function () {
    resizeGridHeight();
    $(window).on('resize', resizeGridHeight);

    var urlMatch = window.location.search.match(/[?&]url=([^?&]+)/),
        queryURL = urlMatch && urlMatch[1];
    if (queryURL) {
        var url = decodeURIComponent(queryURL);
        $('#input-form .url').val(url);
        renderFromURL(url);
    }
});
