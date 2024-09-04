export const getWorkspaceType = (type:string) => {
    if (type === 'engineering') return 'Engineering IT'
    else if (type === 'business') return 'Business'
    else if (type === 'sales') return 'Sales'
    else if (type === 'project') return 'Project Management'
    else if (type === 'education') return 'Education'
    else return ''
}

export const projectThemes = ['#E1345E', '#419E55', '#9747FF', '#4779B4', '#DACA3C', '#F78D2B', '#D62828', '#9A156D', '#ffffff'];

export const labelThemes = ['darkgreen', 'yellow', '#4779B4', 'yellowgreen', 'darkorange', 'red', 'rebeccapurple'];

export const descriptionModules = {
    toolbar: [
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link'],
        ['clean']
    ]
};

export const featureModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'checklist' }],
      ['bold', 'italic', 'underline'],
      ['clean']
    ]
};

export const highlightModules = {
    toolbar: [
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['bold', 'italic', 'underline'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
    ]
};

export const basicModules = {
    toolbar: [
        ['bold', 'italic', 'underline']            
    ]
};