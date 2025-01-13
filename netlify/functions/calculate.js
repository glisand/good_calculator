exports.handler = async (event) => {
    const { expression } = JSON.parse(event.body);
    const result = eval(expression);
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    };
};