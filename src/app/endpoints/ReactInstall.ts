import { execSync } from 'child_process'
import path from 'path'

export async function createViteProject() {
  const projectName = 'my-vite-app'
  const projectPath = path.join(process.cwd(), projectName)

  try {
    // 1. Create Vite React TS project
    execSync(`npm create vite@latest ${projectName} -- --template react-ts`, { stdio: 'inherit' })

    // 2. Initialize git
    execSync('git init', { cwd: projectPath })
    execSync('git add .', { cwd: projectPath })
    execSync('git commit -m "Initial commit"', { cwd: projectPath })

    // 3. Add remote and push
    const repoUrl = 'git@github.com:tu-usuario/tu-repo.git' // Change to your repo
    execSync(`git remote add origin ${repoUrl}`, { cwd: projectPath })
    execSync('git branch -M main', { cwd: projectPath })
    execSync('git push -u origin main', { cwd: projectPath })

    return { success: true, message: 'Project created and pushed to GitHub' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
