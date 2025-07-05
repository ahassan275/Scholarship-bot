
import os
import json
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum

from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from tavily import TavilyClient
from pydantic import BaseModel


class ConversationState(Enum):
    PROFILING = "profiling"
    SEARCHING = "searching"
    RESPONDING = "responding"
    COMPLETE = "complete"


@dataclass
class UserProfile:
    field_of_study: str = ""
    education_level: str = ""
    gpa: float = 0.0
    location: str = ""
    citizenship: str = ""
    financial_need: str = ""
    extracurriculars: List[str] = None
    research_interests: List[str] = None
    career_goals: str = ""
    
    def __post_init__(self):
        if self.extracurriculars is None:
            self.extracurriculars = []
        if self.research_interests is None:
            self.research_interests = []
    
    def is_complete(self) -> bool:
        required_fields = [self.field_of_study, self.education_level, self.location, self.citizenship]
        return all(field.strip() for field in required_fields)
    
    def to_search_context(self) -> str:
        return f"""
        Field of Study: {self.field_of_study}
        Education Level: {self.education_level}
        Location: {self.location}
        Citizenship: {self.citizenship}
        GPA: {self.gpa if self.gpa > 0 else 'Not specified'}
        Financial Need: {self.financial_need}
        Research Interests: {', '.join(self.research_interests) if self.research_interests else 'Not specified'}
        Career Goals: {self.career_goals}
        """


class ScholarshipBot:
    def __init__(self):
        # Initialize APIs
        self.groq_api_key = os.environ.get('GROQ_API_KEY')
        self.tavily_api_key = os.environ.get('TAVILY_API_KEY')
        
        if not self.groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        if not self.tavily_api_key:
            raise ValueError("TAVILY_API_KEY environment variable is required")
        
        # Initialize clients
        self.groq_chat = ChatGroq(
            groq_api_key=self.groq_api_key,
            model_name='llama3-70b-8192',
            temperature=0.02
        )
        self.tavily_client = TavilyClient(api_key=self.tavily_api_key)
        
        # Initialize conversation state
        self.state = ConversationState.PROFILING
        self.user_profile = UserProfile()
        self.search_results = []
        self.pending_confirmation = None
        
        # Initialize memory
        self.memory = ConversationBufferWindowMemory(
            k=10,
            memory_key="chat_history",
            return_messages=True
        )

    def profiler_agent(self, user_input: str) -> str:
        """Agent 1: Profiles the user and extracts relevant information"""
        
        system_prompt = f"""
        You are a Profiler Agent for a scholarship guidance system. Your job is to gather complete user information.
        
        Current user profile:
        {self.user_profile.to_search_context()}
        
        IMPORTANT RULES:
        1. Ask ONE question at a time to gather missing information
        2. Extract and update profile information from user responses
        3. Required fields: field_of_study, education_level, location, citizenship
        4. Optional but helpful: GPA, financial_need, research_interests, career_goals, extracurriculars
        5. Be conversational and friendly
        6. When asking about citizenship, clarify: "What is your citizenship/nationality? This is crucial as scholarships have specific eligibility requirements based on citizenship."
        7. Once you have the required information, say "PROFILE_COMPLETE" to proceed to search
        
        Focus on gathering the most important missing information first. Emphasize that citizenship information is critical for finding eligible scholarships.
        """
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{human_input}")
        ])
        
        conversation = LLMChain(
            llm=self.groq_chat,
            prompt=prompt,
            verbose=False,
            memory=self.memory
        )
        
        response = conversation.predict(human_input=user_input)
        
        # Extract information from user input
        self._extract_profile_info(user_input)
        
        if "PROFILE_COMPLETE" in response or self.user_profile.is_complete():
            self.state = ConversationState.SEARCHING
            return f"{response}\n\nGreat! I have enough information. Let me search for relevant scholarships for you..."
        
        return response

    def research_agent(self, query: str) -> List[Dict[str, Any]]:
        """Agent 2: Performs live web search using Tavily"""
        
        # Construct citizenship-specific search queries
        citizenship_query = f"""
        scholarships grants funding for {self.user_profile.citizenship} citizens 
        {self.user_profile.field_of_study} {self.user_profile.education_level} 
        international students 2024 2025
        """
        
        # Also search for location-specific opportunities
        location_query = f"""
        scholarships {self.user_profile.location} university 
        {self.user_profile.field_of_study} {self.user_profile.education_level}
        {self.user_profile.citizenship} international students
        """
        
        try:
            # Primary search focused on citizenship eligibility
            citizenship_results = self.tavily_client.search(
                query=citizenship_query,
                search_depth="advanced",
                max_results=6,
                include_answer=True,
                include_raw_content=False,
                include_domains=None
            )
            
            # Secondary search for institution-specific scholarships
            location_results = self.tavily_client.search(
                query=location_query,
                search_depth="advanced", 
                max_results=4,
                include_answer=True,
                include_raw_content=False
            )
            
            # Search for application tips
            tips_query = f"scholarship application tips {self.user_profile.field_of_study} personal statement {self.user_profile.citizenship}"
            tips_results = self.tavily_client.search(
                query=tips_query,
                search_depth="basic",
                max_results=3,
                include_answer=True
            )
            
            # Combine results with source tracking
            all_results = {
                'citizenship_scholarships': citizenship_results,
                'location_scholarships': location_results,
                'application_tips': tips_results,
                'user_profile': self.user_profile.to_search_context()
            }
            
            self.search_results = all_results
            return all_results
            
        except Exception as e:
            print(f"Search error: {e}")
            return {"error": str(e)}

    def response_agent(self, search_data: Dict[str, Any]) -> str:
        """Agent 3: Synthesizes search results and provides structured response"""
        
        system_prompt = """
        You are a Response Agent for a scholarship guidance system. Your job is to synthesize search results 
        and provide comprehensive, actionable scholarship guidance.
        
        CRITICAL REQUIREMENTS:
        1. **CITIZENSHIP ELIGIBILITY FIRST**: Only recommend scholarships that explicitly allow the user's citizenship/nationality
        2. **SOURCE ATTRIBUTION**: Always include the source URL for each scholarship mentioned using format: [Source: URL]
        3. **VERIFICATION NOTE**: Always remind users to verify eligibility on the official website
        
        RESPONSE STRUCTURE:
        1. ** Scholarships for [User's Citizenship] Citizens** (3-5 scholarships they can actually apply for)
        2. **Application Guidance** (specific tips for their profile and citizenship)
        3. ** Next Steps** (concrete action items with deadlines)
        4. ** Additional Resources** (relevant links with sources)
        
        FORMATTING RULES:
        - Each scholarship must include: Name, Amount (if available), Deadline, Eligibility, Application process
        - Include source URL for each scholarship: [Source: website.com]
        - Use clear headers and bullet points
        - Emphasize citizenship-specific eligibility criteria
        - Always ask for confirmation before proceeding with detailed application support
        
        AVOID:
        - Recommending scholarships limited to US citizens unless user is from US
        - Generic advice without considering user's specific citizenship
        - Scholarships without clear source attribution
        """
        
        search_context = json.dumps(search_data, indent=2)
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=system_prompt),
            HumanMessagePromptTemplate.from_template(
                "Based on this search data and user profile, provide comprehensive scholarship guidance:\n\n{search_context}"
            )
        ])
        
        conversation = LLMChain(
            llm=self.groq_chat,
            prompt=prompt,
            verbose=False
        )
        
        response = conversation.predict(search_context=search_context)
        
        # Set up confirmation for next steps
        self.pending_confirmation = "application_support"
        
        return response + "\n\n" + "Would you like me to provide detailed application support for any of these scholarships? (Yes/No)"

    def _extract_profile_info(self, user_input: str):
        """Extract profile information from user input using LLM"""
        
        extraction_prompt = f"""
        Extract profile information from this user input: "{user_input}"
        
        Current profile: {self.user_profile.to_search_context()}
        
        Return ONLY a JSON object with any new information found. Use these exact keys:
        - field_of_study
        - education_level  
        - gpa
        - location
        - citizenship
        - financial_need
        - research_interests (array)
        - career_goals
        - extracurriculars (array)
        
        If no new information is found, return empty JSON {{}}.
        """
        
        try:
            conversation = LLMChain(
                llm=self.groq_chat,
                prompt=ChatPromptTemplate.from_messages([
                    SystemMessage(content=extraction_prompt)
                ]),
                verbose=False
            )
            
            result = conversation.predict(input="extract")
            
            # Try to parse JSON and update profile
            try:
                extracted_data = json.loads(result.strip())
                for key, value in extracted_data.items():
                    if hasattr(self.user_profile, key) and value:
                        if isinstance(value, list):
                            current_list = getattr(self.user_profile, key) or []
                            updated_list = list(set(current_list + value))
                            setattr(self.user_profile, key, updated_list)
                        else:
                            setattr(self.user_profile, key, value)
            except json.JSONDecodeError:
                pass  # Continue without extraction if JSON parsing fails
                
        except Exception as e:
            print(f"Profile extraction error: {e}")

    def process_message(self, user_input: str) -> str:
        """Main message processing orchestrator"""
        
        user_input = user_input.strip().lower()
        
        # Handle confirmations
        if self.pending_confirmation:
            if user_input in ['yes', 'y', 'ok', 'sure']:
                if self.pending_confirmation == "application_support":
                    self.pending_confirmation = None
                    return self._provide_application_support()
            elif user_input in ['no', 'n', 'not now']:
                self.pending_confirmation = None
                return "No problem! Feel free to ask if you need anything else or want to search for different scholarships."
        
        # Route to appropriate agent based on current state
        if self.state == ConversationState.PROFILING:
            return self.profiler_agent(user_input)
            
        elif self.state == ConversationState.SEARCHING:
            self.state = ConversationState.RESPONDING
            search_results = self.research_agent(user_input)
            if "error" in search_results:
                return f"I encountered an error while searching: {search_results['error']}. Let me try to help based on general knowledge instead."
            return self.response_agent(search_results)
            
        elif self.state == ConversationState.RESPONDING:
            # Handle follow-up questions
            return self._handle_followup(user_input)
        
        return "I'm not sure how to help with that. Could you please rephrase your question?"

    def _provide_application_support(self) -> str:
        """Provide detailed application support"""
        
        support_prompt = f"""
        Provide detailed application support for a student with this profile:
        {self.user_profile.to_search_context()}
        
        Include:
        1. **Personal Statement Template** - customized for their field
        2. **Application Timeline** - step-by-step with deadlines
        3. **Document Checklist** - everything they need to prepare
        4. **Interview Preparation** - common questions and tips
        5. **Follow-up Strategy** - how to track applications
        
        Be specific and actionable.
        """
        
        conversation = LLMChain(
            llm=self.groq_chat,
            prompt=ChatPromptTemplate.from_messages([
                SystemMessage(content=support_prompt)
            ]),
            verbose=False
        )
        
        return conversation.predict(input="provide support")

    def _handle_followup(self, user_input: str) -> str:
        """Handle follow-up questions and requests"""
        
        followup_prompt = f"""
        User profile: {self.user_profile.to_search_context()}
        Previous search results available: {bool(self.search_results)}
        
        User follow-up: "{user_input}"
        
        Provide helpful response based on context. If they want new search, set state back to searching.
        If they want to modify their profile, help them update it.
        """
        
        conversation = LLMChain(
            llm=self.groq_chat,
            prompt=ChatPromptTemplate.from_messages([
                SystemMessage(content=followup_prompt),
                MessagesPlaceholder(variable_name="chat_history"),
                HumanMessagePromptTemplate.from_template("{human_input}")
            ]),
            verbose=False,
            memory=self.memory
        )
        
        return conversation.predict(human_input=user_input)


def main():
    """Main application entry point"""
    
    print("🎓 Welcome to the AI-Powered Scholarship Agent!")
    print("I'm your intelligent scholarship advisor with live web search capabilities.")
    print("I'll help you find personalized scholarships and guide you through the application process.")
    print("-" * 80)
    
    try:
        agent = ScholarshipBot()
        
        print("\nLet's start by getting to know you better. This will help me find the most relevant scholarships.")
        print("You can type 'quit' anytime to exit.\n")
        
        while True:
            user_input = input("You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\nAgent: Thank you for using the Scholarship Bot! Good luck with your applications! 🎓")
                break
            
            if not user_input:
                continue
                
            try:
                response = agent.process_message(user_input)
                print(f"\nAgent: {response}\n")
                
            except Exception as e:
                print(f"\nAgent: I encountered an error: {e}")
                print("Please try rephrasing your question.\n")
                
    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("\nPlease make sure to set the following environment variables:")
        print("- GROQ_API_KEY: Get from https://console.groq.com/keys")
        print("- TAVILY_API_KEY: Get from https://tavily.com")
    except Exception as e:
        print(f"Startup Error: {e}")


if __name__ == "__main__":
    main()
