module.exports = {
    activatedRoute(routeName, expectedRouteName, activeClassname = 'active') {
        if (routeName === expectedRouteName) {
            return activeClassname;
        }
        return '';
    },
    renderEditorContent(block) {
        switch (block.type) {
            case 'paragraph':
                return `<p>${block.data.text}</p>`;
            case 'header': {
                if (block.data.level === 1) {
                    return `<h1>${block.data.text}</h1>`;
                }
                if (block.data.level === 2) {
                    return `<h2>${block.data.text}</h2>`;
                }
                if (block.data.level === 3) {
                    return `<h3>${block.data.text}</h3>`;
                }
                if (block.data.level === 4) {
                    return `<h4>${block.data.text}</h4>`;
                }
                if (block.data.level === 5) {
                    return `<h5>${block.data.text}</h5>`;
                }
            }
            case 'list': {
                if (block.data.style === 'unordered') {
                    const content = block.data.items.map(item => `<li>${item}</li>`).join('');
                    return `<ul>${content}</ul>`;
                }
                if (block.data.style === 'ordered') {
                    const content = block.data.items.map(item => `<li>${item}</li>`).join('');
                    return `<ol>${content}</ol>`;
                }
            }
            case 'quote': {
                return `<q>${block.data.text}</q>`;
            }
            case 'embed': {
                return `<iframe width="${block.data.width}" height="${block.data.height}" src="${block.data.embed}"></iframe>`;
            }
            case 'image': {
                return `
                    <figure>
                        <img src="${block.data.url}" />
                        <figcaption>${block.data.caption}</figcaption>
                    </figure>
                
                `;
            }

        }
    }
};
