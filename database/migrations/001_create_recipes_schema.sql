-- Create recipes table
CREATE TABLE recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    macros JSONB DEFAULT '{}'::jsonb,
    video_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create boards table
CREATE TABLE boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create board_recipes table (many-to-many join)
CREATE TABLE board_recipes (
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (board_id, recipe_id)
);

-- Create board_members table
CREATE TABLE board_members (
    board_id UUID REFERENCES boards(id) ON DELETE CASCADE NOT NULL,
    member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (board_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_owner_id ON recipes(owner_id);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_board_recipes_board_id ON board_recipes(board_id);
CREATE INDEX idx_board_recipes_recipe_id ON board_recipes(recipe_id);
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_member_id ON board_members(member_id);

-- Enable Row Level Security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes table
CREATE POLICY "Users can view their own recipes" ON recipes
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own recipes" ON recipes
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own recipes" ON recipes
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for boards table
CREATE POLICY "Users can view boards they own or are members of" ON boards
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        EXISTS (
            SELECT 1 FROM board_members 
            WHERE board_id = boards.id AND member_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own boards" ON boards
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Board owners can update their boards" ON boards
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Board owners can delete their boards" ON boards
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for board_recipes table
CREATE POLICY "Users can view board recipes for boards they have access to" ON board_recipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = board_id AND (
                boards.owner_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM board_members 
                    WHERE board_members.board_id = boards.id AND member_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Board owners and members can add recipes to boards" ON board_recipes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = board_id AND (
                boards.owner_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM board_members 
                    WHERE board_members.board_id = boards.id AND member_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Board owners and members can remove recipes from boards" ON board_recipes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = board_id AND (
                boards.owner_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM board_members 
                    WHERE board_members.board_id = boards.id AND member_id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for board_members table
CREATE POLICY "Users can view board members for boards they have access to" ON board_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = board_id AND (
                boards.owner_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM board_members bm2
                    WHERE bm2.board_id = boards.id AND bm2.member_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Board owners can manage board members" ON board_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM boards 
            WHERE boards.id = board_id AND boards.owner_id = auth.uid()
        )
    );

-- Function to automatically add board owner as a member
CREATE OR REPLACE FUNCTION add_board_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO board_members (board_id, member_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add board owner as a member
CREATE TRIGGER trigger_add_board_owner_as_member
    AFTER INSERT ON boards
    FOR EACH ROW
    EXECUTE FUNCTION add_board_owner_as_member();
