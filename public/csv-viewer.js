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
        renderFromURL(url);
    }
    return false;
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

var options = {
        enableCellNavigation: true,
        enableColumnReorder: false
    },
    slickgrid = new Slick.Grid('#grid', [], [], options);

var queryURL = window.location.search.match(/[?&]url=([^?&]+)/)[1];
if (queryURL) {
    var url = decodeURIComponent(queryURL);
    $('#input-form .url').val(url);
    renderFromURL(url);
}
