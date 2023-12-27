const signupBtn = document.getElementById('signup-btn')

signupBtn.addEventListener('click', async (e) =>{
    e.preventDefault();
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    

    const result =  await fetch('http://localhost:3000/signup',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
    if(result.ok){
        console.log("USER CREATED")
    }else{
        const errorData = await result.json();  // Assuming the error response is JSON
        console.error("Error:", errorData);
        console.log("error")
    }
})