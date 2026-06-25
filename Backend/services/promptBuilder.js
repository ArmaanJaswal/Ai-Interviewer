export function buildFirstQuestionPrompt({name,role,skills,experience}){
    const systemPrompt = `You are a professional technical interviewer.Generate an initial interview question matching the cnadiate's profile. Your output must conform excatly to the JSON provided`;

    const userPrompt=`Candidate Profile:
    -Name:${name},
    -Role:${role},
    -Skills:${skills.join(', ')},
    -Experience:${experience} years
    Generate the first question.`;
    return {systemPrompt,userPrompt}
}