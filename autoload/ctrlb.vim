
function! ctrlb#execute(arg_string) abort
    return _ctrlb_execute(a:arg_string)
endfunction

function! ctrlb#open(arg_string) abort
    return _ctrlb_open(a:arg_string)
endfunction

function! ctrlb#custom(name, value) abort
    call _ctrlb_custom(a:name, a:value)
endfunction
