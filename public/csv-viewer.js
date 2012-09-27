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

$('#filter').on('change', function () {
    slickgrid.getData().setFilter(this.value);
    slickgrid.invalidate();
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
    var array = CSVToArray(str),
        headerRow = array.shift(),
        columns = headerRow.map(function (header, i) {
            header = header || '';
            return {name: header, field: i, id: header, sortable: true};
        });
    slickgrid.setColumns(columns);
    slickgrid.setData(new DataView(array));
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
        enableAddRow: false
    },
    slickgrid = new Slick.Grid('#grid', [], [], options);

slickgrid.onSort.subscribe(function (e, args) {
    var data = slickgrid.getData();
    data.sortBy(args.sortCol.field, args.sortAsc);
    slickgrid.invalidate();
});

function DataView(array) {
    var self = this;
    this.array = array;
    this.filter = null;
    this.filteredIndexes = null;
    this.sortBy = function (column, asc) {
        self.array.sort(function (a, b) {
            var x = a[column], y = b[column];
            if (x === void 0) return asc ? 1 : -1;
            if (y === void 0) return asc ? -1 : 1;
            return (asc ? 1 : -1) * (x < y ? -1 : x > y ? 1 : 0);
        });
        self.setFilter(self.filter);
    };
    this.setFilter = function (filter) {
        filter = filter && filter.trim();
        self.filter = filter;
        if (!filter) {
            self.filteredIndexes = null;
            return;
        }
        var words = filter.split(/\s+/g),
            numbers = words.map(function (word) { return parseFloat(word); });
        function test(item) {
            return item.some(function (value) {
                if (typeof value === 'number') {
                    return numbers.some(function (number) {
                        return number === value;
                    });
                }
                else {
                    return words.some(function (word) {
                        return ~value.indexOf(word);
                    });
                }
            });
        }
        self.filteredIndexes = [];
        self.array.forEach(function (item, i) {
            if (test(item)) {
                self.filteredIndexes.push(i);
            }
        });
    };
    this.getLength = function () {
        return self.filteredIndexes ? self.filteredIndexes.length : self.array.length;
    };
    this.getItem = function (i) {
        return self.filteredIndexes ? self.array[self.filteredIndexes[i]] : self.array[i];
    };
}

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
