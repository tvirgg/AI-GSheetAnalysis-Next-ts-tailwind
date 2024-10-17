'use server'
async function sleep (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createTodo(prevState: any, formData: FormData) {  
  try {
    await sleep(2000)
    return { message: 'Created' }
  } catch (e) {
    return { message: 'Failed to create' }
  }
}

export async function authorization (formData: FormData) {  
  await signIn('credentials', formData)
}

export async function googleAuthorization () {  
  // await signIn('google')
}

function signIn(arg0: string, formData: FormData) {
  throw new Error("Function not implemented.");
}
