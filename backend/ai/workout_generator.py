# ai/workout_generator.py
from ai.openai_client import generate_with_openai

def create_workout_prompt(user_data):
    return f"""
Generate a 4-week personalized workout plan for a user with the following profile:

- Goal: {user_data['goal']}
- Age: {user_data['age']}
- Gender: {user_data['gender']}
- Weight: {user_data['weight']} lbs
- Height: {user_data['height']} inches
- Activity level: {user_data['activity_level']}
- Experience level: {user_data['experience_level']}
- Any medical conditions: {user_data.get('medical_conditions', 'None')}

For **each lifting exercise**, also include a recommended starting weight in pounds
based on their weight, experience level, and safety.

Format the plan by weeks and include:
- Rest days
- Target muscle groups
- Suggested reps and sets
- **Recommended starting weight in lbs**
- Optional cardio recommendations
"""

def generate_workout_plan(user_data):
    prompt = create_workout_prompt(user_data)
    return generate_with_openai(prompt)





#from ai.openai_client import generate_with_openai

#def create_workout_prompt(user_data):
#    return f"""
#Generate a 4-week personalized workout plan for a user with the following profile:

#- Goal: {user_data['goal']}
#- Age: {user_data['age']}
#- Gender: {user_data['gender']}
#- Weight: {user_data['weight']} lbs
#- Height: {user_data['height']} inches
#- Activity level: {user_data['activity_level']}
#- Experience level: {user_data['experience_level']}
#- Any medical conditions: {user_data.get('medical_conditions', 'None')}

#Format the plan by weeks and include:
#- Rest days
#- Target muscle groups
#- Suggested reps and sets
#- Optional cardio recommendations
#"""

#def generate_workout_plan(user_data):
#    prompt = create_workout_prompt(user_data)
#    return generate_with_openai(prompt)
