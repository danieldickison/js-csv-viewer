if (!'history' in window ||
    !window.history.replaceState ||
    !Array.prototype.map) {
    alert('This browser is not supported');
}

$('#input-form').submit(function () {
    var text = $(this).find('.csv').val(),
        file = $(this).find('.file')[0].files[0],
        url = $(this).find('.url').val();
    if (text) {
        renderCSVString(text);
    }
    else if (file) {
        // TODO read and parse file.
    }
    else if (url) {
        history.replaceState(null, null, '?url=' + url);
        renderFromURL(url);
    }
    return false;
})
.find('.url').on('change', function () {
    $('#input-form .csv').text('');
    $('#input-form .file').val('');
});

function renderFromURL(url) {
    $.ajax({
        url: '/remote-csv',
        data: {
            url: url
        },
        dataType: 'text'
    })
    .done(function (data) {
        $('#input-form .csv').text(data);
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
    $('#grid').height(windowHeight - inputPanelHeight - 40);
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
